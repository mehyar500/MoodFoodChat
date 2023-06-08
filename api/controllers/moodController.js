// controllers/moodController.js
const Mood = require('../models/Mood');
const Cuisine = require('../models/Cuisine');
const User = require('../models/User');
const Food = require('../models/Food');
const GodModeUser = require('../models/GodModeUser');
const logger = require('../logger');
const OpenAIRateLimiter = require('../utils/OpenAIRateLimiter');
const { Configuration, OpenAIApi } = require("openai");
const { searchFoodImage } = require('../services/googleapi');

require('dotenv').config();

const openaiRateLimiter = new OpenAIRateLimiter(20 / 60); // 20 requests per minute
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getAvailableCuisines = async (req, res) => {
  try {

    const cuisines = await Cuisine.find({});

    if (!cuisines) {
      return res.status(404).json({ error: 'Cuisines not found' });
    }

    res.status(200).json(cuisines);
  } catch (error) {
    console.error('Error getting available cuisines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.saveUserPreference = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { userMenu } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.preference = { userMenu: userMenu };
    await user.save();

    res.status(200).json({ message: 'User bookmark saved successfully' });

  } catch (error) {
    console.error('Error saving user preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.removeMenuItem = async (req, res) => {
  const { userId } = req.params;
  const { itemToRemove } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || !user.preference || !user.preference.userMenu) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    const updatedMenuItems = user.preference.userMenu.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(itemToRemove)
    );

    user.preference.userMenu = updatedMenuItems;
    await user.save();

    res.status(200).json({ message: 'Menu item removed successfully', userMenu: user.preference.userMenu });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getUserMoods = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userMoods = await Mood.find({ userId: userId });

    if (!userMoods) {
      return res.status(404).json({ error: 'User moods not found' });
    }

    res.status(200).json(userMoods);
  } catch (error) {
    console.error('Error getting user moods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createMood = async (req, res) => {
  try {
    const { message, cuisines, myMenu, numRecommendations, foodCategories } = req.body;
    const userId = req.params.userId;
    logger.info(`User Id: ${userId} - Received mood message: "${JSON.stringify(message)}"`);

    const user = await User.findById(userId);

    if (await shouldLookupOpenAI(user, userId)) {
      const response = await handleUserMessage(message, cuisines, numRecommendations, foodCategories, userId, myMenu);
      res.status(200).json(response);
    } else {
      res.status(403).json({ error: 'User reached their mood creation limit', reason: 'limit' });
    }
    
  } catch (err) {
    logger.error(`Error creating mood: ${err}`);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

async function handleUserMessage(userMessage, cuisines, numRecommendations, foodCategories, userId, myMenu) {
  try {
    // Get or create mood with recommendations
    const savedMood = await getOrCreateMood(userMessage, userId, cuisines, numRecommendations, foodCategories, myMenu);

    // Get or create mood media
    const recommendations = await getFoodRecommendations(savedMood);

    // Prepare the response
    const response = {
      message: userMessage,
      recommendations: recommendations,
      emotions: savedMood.emotions,
    };

    logger.info(`API created mood response finished`);

    return response;
  } catch (error) {
    logger.error(`Error processing message: ${error.message}`);
  }
};

async function getFoodRecommendations(mood) {
  try {
    const updatedRecommendations = await Promise.all(
      mood.recommendations.map(async recommendation => {
        let food = await Food.findOne({
          title: recommendation.title,
          category: recommendation.foodCategory
        });

        if (!food) {
          food = new Food({
            title: recommendation.title,
            category: recommendation.foodCategory,
            cuisine: recommendation.cuisine,
            meta: {
              reason_for_recommendation: recommendation.reason_for_recommendation,
            }
          });
          await food.save();
        }

        if (!food.meta || !food.meta.imageUrl) {
          const searchResults = await searchFoodImage(food.title);
          const bestMatch = searchResults.find(result => result.title.toLowerCase().includes(food.title.toLowerCase()));
          const imageUrl = bestMatch ? bestMatch.imageUrl : (searchResults[0] ? searchResults[0].imageUrl : null);

          food.meta = {
            ...food.meta,
            imageUrl,
          };

          await food.save();
        }

        return {
          _id: food._id,
          title: food.title,
          foodCategory: food.category,
          cuisine: food.cuisine,
          reason_for_recommendation: recommendation.meta.reason_for_recommendation,
          meta: food.meta
        };
      })
    );

    return updatedRecommendations.filter(r => r !== null);

  } catch (error) {
    console.error('Error getting food recommendations:', error.message);
  }
};

async function getOrCreateMood(userMessage, userId, cuisines, numRecommendations, foodCategories, myMenu) {
  try {
    if (!userMessage) {
      throw new Error('Message is required.');
    }

    let mood = await Mood.findOne({ message: userMessage, userId: userId });

    if (myMenu) {
      cuisines = ['myItem'];
    }

    const shouldGenerateRecommendations = !mood
      || mood.recommendations.length === 0
      || JSON.stringify(mood.filters) !== JSON.stringify(cuisines);

    if (shouldGenerateRecommendations) {
      const generatedData = await generateRecommendations(userMessage, cuisines, numRecommendations, foodCategories, userId);
      console.log('generatedData', generatedData);
      // Map through the recommendations object and structure it
      const structuredRecommendations = await Promise.all(
        Object.entries(generatedData.recommendations).flatMap(async ([foodCategory, recommendations]) => {
          return await Promise.all(recommendations.map(async recommendation => {
            // Use findOneAndUpdate with upsert option to create or update the Food document
            const food = await Food.findOneAndUpdate(
              { title: recommendation.title.toLowerCase(), category: foodCategory.toLowerCase() },
              { cuisine: recommendation.cuisine.toLowerCase() },
              { upsert: true, new: true }
            );

            // Return an object with the food ID, foodCategory, and cuisine
            return {
              foodId: food._id,
              title: recommendation.title.toLowerCase(),
              foodCategory: foodCategory.toLowerCase(),
              cuisine: food.cuisine.toLowerCase(),
              meta: {
                reason_for_recommendation: recommendation.reason_for_recommendation,
              },
            };
          }));
        })
      ).then(foodIds => foodIds.flat());
      
      if (mood) {
        // Update the existing mood
        mood.recommendations = structuredRecommendations;
        mood.emotions = generatedData.emotions;
        mood.filters = cuisines;
        await mood.save();
      } else {
        // Create a new mood
        mood = new Mood({ 
          message: userMessage, 
          userId: userId, 
          emotions: generatedData.emotions, 
          recommendations: structuredRecommendations,
          filters: cuisines
        });

        await mood.save();
      }

      logger.info(`Mood saved with ID: ${mood._id}`);
    } else {
      logger.info(`Mood already exists with ID: ${mood._id}`);
    }

    return mood;

  } catch (error) {
    // Handle any errors that occur within the function
    logger.error(`Error in getOrCreateMood: ${error.message}`);
  }
};

async function generateRecommendations(message, cuisines, numRecommendations, foodCategories, userId, counter = 0) {
  const openai = new OpenAIApi(configuration);
  message = message.trim();
  let consideringOnly = cuisines.length > 0 ? `, considering only the following cuisines: ${cuisines}` : ``;
  let consideringOnly2 = cuisines.length > 0 ? `considering only the following cuisines: ${cuisines}` : ``;

  if (cuisines.includes('myItem')) {
    const userMenuData = await fetchMenu(userId);
    consideringOnly = `, considering only the following menu items: ${JSON.stringify(userMenuData.menuItems)}`;
    consideringOnly2 = `considering only the following menu items: ${JSON.stringify(userMenuData.menuItems)}`;
  }

  const numberOfRecommendations = numRecommendations || 1;
  const systemMessage = `As a mood-based AI food expert, decipher the emotional landscape of the user input and generate a JSON object with personalized recommendations for food${consideringOnly}.
  Conisder only the following food categories: ${foodCategories}.
  Detect user's language and respond in the same language.
  Complement the recommendations with a concise summary of the user's emotions, and feelings.
  Ensure that the recommendations are diverse and not repetitive, providing the user with a wide range of options to choose from.
  Ensure the reason for recommendation is 30 words or less and emphasizes why the mood and the food are aligned, and why it's perfect for the user's mood.
  Structure the JSON string with keys 'recommendations' and 'emotions'.
  For each recommendation, include a 'title', 'foodCategory' and 'cuisine'.
  For each food category, you will include 'reason_for_recommendation'  to explain the reason for the recommendation in details and how each ingredient of the recommendation has its own reason for the pick.
  Provide at least ${numberOfRecommendations} recommendation of each food category.
  Ensure your response is exclusively the JSON string, devoid of any supplementary text, explanations, or introductions.
  For the 'emotions' key, return an array of strings encapsulating the user's emotional spectrum extracted from their input.`;

  const chatMessages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: `The user input is: '${message}'. ${consideringOnly2}` },
  ];
  console.log('chatMessages', chatMessages);
  
  // 'gpt-3.5-turbo' 'gpt-4'
  const GPT_MODEL =  'gpt-3.5-turbo';
  const openaiResponse = await openaiRateLimiter.execute(async () => {
    return await openai.createChatCompletion({
      model: GPT_MODEL, messages: chatMessages,
      max_tokens: 2048,
      temperature: 1,
      top_p: 1,
    });
  });

  const aiMessage = openaiResponse.data.choices[0].message.content;
  console.log('aiMessage', aiMessage);

  const jsonResponse = await validateAndCleanData(userId, aiMessage, cuisines, numRecommendations, foodCategories, message, counter);
  console.log('jsonResponse', jsonResponse);
  return jsonResponse;
};

function formatRecommendations(payload) {
  let recommendations = {};

  // Process the provided JSON structure
  for (const foodCategory in payload.recommendations) {
    if (!recommendations[foodCategory]) {
      recommendations[foodCategory] = [];
    }

    if (Array.isArray(payload.recommendations[foodCategory])) {
      payload.recommendations[foodCategory].forEach(item => {
        recommendations[foodCategory].push(item);
      });
    } else {
      recommendations[foodCategory].push(payload.recommendations[foodCategory]);
    }
  }

  return { recommendations: recommendations, emotions: payload.emotions || [] };
};

const isGodModeUser = async (userId) => {
  const godModeUser = await GodModeUser.findOne({ userId });
  return !!godModeUser;
};

async function shouldLookupOpenAI(user, userId) {
  const now = new Date();

  // Check if tokens need to be reset (e.g., every day)
  const tokensNeedReset =
    !user.tokensUpdatedAt || now - user.tokensUpdatedAt >= 24 * 60 * 60 * 1000;

  if (tokensNeedReset) {
    user.tokens = user.subscriptionType === 'premium' ? 150 : 15;
    user.tokensUpdatedAt = now;
  }

  // Provide default values if tokens or tokensUpdatedAt are not present
  user.tokens = user.tokens ?? (user.subscriptionType === 'premium' ? 150 : 15);
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

async function validateAndCleanData(userId, aiResponse, cuisines, numRecommendations, foodCategories, message, counter) {
  const parsedData = parsePayload(aiResponse);

  if (isValidResponse(parsedData)) {

    const formattedRecommendations = formatRecommendations(parsedData);

    return { recommendations: formattedRecommendations.recommendations, emotions: formattedRecommendations.emotions || [] };
  } else {
    if (counter >= 2) {
      // return empty object if the response is invalid after two attempts
      return {};
    } else {
      // run generate recommendations again
      return await generateRecommendations(message, cuisines, numRecommendations, foodCategories, userId, counter + 1);
    }
  }
};

function isValidResponse(json) {

  const isValidRecommendations =
    Array.isArray(json.recommendations) ||
    (typeof json.recommendations === 'object' && Object.keys(json.recommendations).length > 0);

  return (
    typeof json === 'object' &&
    isValidRecommendations
  );
};

function parsePayload(payload) {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      // If JSON parsing fails, attempt to fix the JSON string and parse again
      const fixedJson = fixInvalidJson(payload);
      return JSON.parse(fixedJson);
    }
  } else {
    return payload;
  }
};

function fixInvalidJson(jsonString) {
  // Fix missing commas between properties
  const missingCommaRegex = /}\s*{/g;
  const correctedJsonWithCommas = jsonString.replace(missingCommaRegex, '}, {');

  // Fix missing commas after property values
  const missingCommaAfterValueRegex = /(["\d\w])\s*(?=["\w])/g;
  const correctedJsonWithCommasAfterValues = correctedJsonWithCommas.replace(
    missingCommaAfterValueRegex,
    '$1, '
  );

  // Fix trailing commas in lists
  const trailingCommaRegex = /,(\s*])+/g;
  const correctedJson = correctedJsonWithCommasAfterValues.replace(
    trailingCommaRegex,
    '$1'
  );

  return correctedJson;
};

async function fetchMenu(userId) {
  try {
    const user = await User.findById(userId);

    if (!user || !user.preference || !user.preference.userMenu) {
      throw new Error('User preferences not found');
    }

    return {
      menuItems: user.preference.userMenu,
    };
  } catch (error) {
    throw error;
  }
};