const User = require('../models/User');
const Food = require('../models/Food');
const logger = require('../logger');
const OpenAIRateLimiter = require('../utils/OpenAIRateLimiter');
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.saveUserPreference = async (req, res) => {
    try {
      const { recipeId } = req.body;
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (user.bookmarkedRecipes.includes(recipeId)) {
        return res.status(400).json({ error: "Recipe already bookmarked" });
      }
  
      user.bookmarkedRecipes.push(recipeId);
      await user.save();
  
      res.status(200).json({ message: "Recipe successfully saved" });
    } catch (error) {
      console.error("Error saving the recipe:", error);
      res.status(500).json({ error: "Failed to save the recipe" });
    }
};

exports.inventFood = async (req, res) => {
    try {
      const { ingredients, cuisines, foodCategory } = req.body;
      const userId = req.params.userId;
      const user = await User.findById(userId);

      if (!cuisines || !foodCategory) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      if (await shouldLookupOpenAI(user)) {

        const inventedFood = await inventFoodViaOpenAI(ingredients, cuisines, foodCategory);
    
        if (!inventedFood || !inventedFood.name || !inventedFood.category || !inventedFood.cuisine || !inventedFood.dalle_prompt) {
            return res.status(500).json({ message: "Failed to generate a new recipe." });
        }
    
        const imageUrl = await generateImageFromDallePrompt(inventedFood.dalle_prompt);

        if (!imageUrl) {
            return res.status(500).json({ message: "Failed to generate an image for the recipe." });
        }

        const foodObejct = {
            title: inventedFood.name,
            category: inventedFood.category,
            cuisine: 'AI',
            ai_generated: true,
            meta: {
            imageUrl: imageUrl,
            ...inventedFood
            },
        };

        const food = new Food(foodObejct);
    
        await food.save();
        console.log("Saved food:", food);
    
        res.status(200).json(food);

      } else {
        res.status(403).json({ error: 'User reached their mood creation limit', reason: 'limit' });
      }
    } catch (error) {
      console.error("Error in inventFood:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};  

async function shouldLookupOpenAI(user) {
    const now = new Date();
  
    // Check if tokens need to be reset (e.g., every day)
    const tokensNeedReset =
      !user.tokensUpdatedAt || now - user.tokensUpdatedAt >= 24 * 60 * 60 * 1000;
  
    if (tokensNeedReset) {
      user.tokens = user.subscriptionType === 'premium' ? 5000 : 1500;
      user.tokensUpdatedAt = now;
    }
  
    // Provide default values if tokens or tokensUpdatedAt are not present
    user.tokens = user.tokens ?? (user.subscriptionType === 'premium' ? 5000 : 1500);
    user.tokensUpdatedAt = user.tokensUpdatedAt ?? now;
  
    // Check if the user has enough tokens
    if (user.tokens > 0) {
      // Update the user's tokens and tokensUpdatedAt
      user.tokens -= 1;
      user.tokensUpdatedAt = now;
      await user.save();
      return true;
    }
  
    return false;
};

async function inventFoodViaOpenAI(ingredients, cuisines, foodCategory) {
    try {
        const openaiRateLimiter = new OpenAIRateLimiter(20 / 60); // 20 requests per minute
        const openai = new OpenAIApi(configuration);
        const cuisinesString = cuisines.join(', ');
        const cuisinesClause = cuisines.length > 0 ? `a mix of ${cuisinesString} and ` : '';
        
        const ingredientsString = ingredients ? ingredients.join(', ') : '';
        const ingredientsClause = ingredientsString.length > 1 ? `Incorporate the following ingredients: ${ingredientsString}.` : '';
        console.log('ingredientsClause', ingredientsClause);
        const systemMessage = `Drawing upon your expertise in creating inventive and never-before-seen dishes, generate a unique and never-before-seen food recipe from ${cuisinesClause}category (${foodCategory}).
        ${ingredientsClause}
        The recipe should be in JSON format, including the recipe name,
        category (e.g., entree, dessert, appetizer),
        cuisine (e.g., Italian, American, Mexican),
        list of ingredients, and an easy-to-follow step-by-step tutorial (directions) on how to make it,
        and a Dall-E AI prompt that can be used to generate a realistic and appealing image of the dish that's not too close up.
        Structure the JSON string with keys 'name', 'category', cuisin', 'ingredients', 'directions' and 'dalle_prompt'.
        Structure the ingredients with keys 'name', 'quantity' in decimal number , and 'unit'.
        Ensure your response is exclusively the JSON string, devoid of any supplementary text, explanations, or introductions.`;

        const chatMessages = [
            { role: 'system', content: systemMessage },
        ];
        console.log('chatMessages', chatMessages);
        const GPT_MODEL = 'gpt-3.5-turbo';
        const openaiResponse = await openaiRateLimiter.execute(async () => {
            return await openai.createChatCompletion({
                model: GPT_MODEL,
                messages: chatMessages,
                max_tokens: 2048,
                temperature: 1,
                top_p: 1,
            });
        });

        const aiMessage = openaiResponse.data.choices[0].message.content;
        console.log('aiMessage', aiMessage);
      
        // Sanitize the JSON string before parsing
        const sanitizedJsonString = sanitizeJSONString(aiMessage);

        // You can parse the sanitizedJsonString into JSON format and return it, or further process it as needed
        const jsonResponse = JSON.parse(sanitizedJsonString);

        return jsonResponse;
    } catch (error) {
        console.error('Error in inventFoodViaOpenAI:', error);
    }
};

function sanitizeJSONString(jsonString) {
    // Remove unexpected commas at the end of the JSON structure
    jsonString = jsonString.replace(/,\s*(\]|\})/g, '$1');
  
    // Escape any unescaped double quotes within strings
    jsonString = jsonString.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_, p1) => {
      return '"' + p1.replace(/"/g, '\\"') + '"';
    });
  
    return jsonString;
};  

async function generateImageFromDallePrompt(prompt) {
    try {
      const openaiRateLimiter = new OpenAIRateLimiter(50 / 60); // 50 requests per minute
      const openai = new OpenAIApi(configuration);

      const response = await openaiRateLimiter.execute(async () => {
        return await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
          });
      });
  
      const generatedImageURL = response.data.data[0].url;
      return generatedImageURL;
    } catch (error) {
      console.error("Error generating image from DALL-E:", error);
    }
};

