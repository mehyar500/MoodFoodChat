const Food = require('../models/Food');
const MessagesAI = require('../models/MessagesAI');
const User = require('../models/User');
const logger = require('../logger');
const OpenAIRateLimiter = require('../utils/OpenAIRateLimiter');
const { Configuration, OpenAIApi } = require("openai");
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({ region: 'us-east-1' });
const s3 = new AWS.S3({ region: 'us-east-1' });
const sleep = require('util').promisify(setTimeout);
const { searchFoodImage } = require('../services/googleapi');
const axios = require('axios');

require('dotenv').config();

const userTimeouts = new Map();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

async function shouldLookupOpenAI(user) {
    const now = new Date();

    // Check if tokens need to be reset (e.g., every day)
    const tokensNeedReset =
        !user.tokensUpdatedAt || now - user.tokensUpdatedAt >= 24 * 60 * 60 * 1000;

    if (tokensNeedReset) {
        user.tokens = user.subscriptionType === 'premium' ? 100000 : 10000;
        user.tokensUpdatedAt = now;
    }

    // Provide default values if tokens or tokensUpdatedAt are not present
    user.tokens = user.tokens ?? (user.subscriptionType === 'premium' ? 100000 : 10000);
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

async function saveMessageHistory(userId, message) {
    try {
        let messagesAI = await MessagesAI.findOne({ user: userId });

        if (!messagesAI) {
            messagesAI = new MessagesAI({ user: userId });
        }

        messagesAI.messages.push(message);

        await messagesAI.save();
    } catch (err) {
        console.error('Error while saving message history:', err);
    }
};

async function processFoodImage(imageKey, mostConfidentLabelOnly = false) {
    console.log('Processing food image...');
    try {
        const s3Params = {
            Bucket: 'moodfood-chefai',
            Key: imageKey,
        };

        const imageObject = await s3.getObject(s3Params).promise();
        const imageBytes = imageObject.Body;

        const params = {
            Image: {
                Bytes: imageBytes,
            },
            MaxLabels: 10,
            MinConfidence: 70,
        };

        const rekognitionResult = await rekognition.detectLabels(params).promise();
        const foodLabels = rekognitionResult.Labels.filter((label) =>
            label.Parents.some((parent) => parent.Name === 'Food')
        );

        if (mostConfidentLabelOnly) {
            foodLabels.sort((a, b) => b.Confidence - a.Confidence);
            return foodLabels[0].Name;
        } else {
            return foodLabels.map((label) => label.Name).join(', ');
        }
    } catch (err) {
        console.log('Error processing food image', err);
    }
};

const updateUserTokens = async (socket, totalTokens) => {
    try {
        // temporarily deduct 50% of the tokens 
        totalTokens = totalTokens / 2;
        socket.user.tokens -= totalTokens;
        socket.user.tokensUpdatedAt = new Date();
        await socket.user.save();

        return socket.user;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

async function resetUserSession(socket) {
    socket.userSession.intent = null;
    socket.userSession.response = null;
    socket.userSession.lastImageIdentify = null;
    await saveUserSession(socket);
};

async function saveUserSession(socket) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            socket.userId,
            { session: socket.userSession },
            { new: true }
        );
    } catch (err) {
        console.error('Error saving user session:', err);
    }
};

function getFollowUpSystemMessage(intent) {
    console.log('Getting follow up system message for intent:', intent);
    switch (intent) {
        case 'createNewRecipe':
            return `Create a recipe based on user preferences.
            The recipe should be in JSON format, including keys recipe_name, ingredients, directions, and dalle_prompt.
            list of ingredients, and an easy-to-follow step-by-step tutorial (directions) on how to make it,
            and a Dall-E AI prompt that can be used to generate a realistic and appealing image of the dish that's not too close up.
            Structure the JSON string with keys 'recipe_name', 'ingredients', 'directions' and 'dalle_prompt'.
            Ensure your response is exclusively the JSON string, devoid of any supplementary text, explanations, or introductions.`;
        case 'recipeQuestion':
            return `Find out what recipe the user is inquiring about and provide it.
            The recipe should be in JSON format, including keys recipe_name, cuisine, ingredients, directions and menu_category (appetizer, entree, dessert ..etc ).
            Ensure your response is exclusively the JSON string, devoid of any supplementary text, explanations, or introductions.`;
        case 'foodRecommendations':
            return `Decipher the emotional landscape of the user input and generate a JSON object with personalized recommendations for food.
            Ensure the reason for recommendation is a line or 2 and emphasizes why the mood and the food are aligned, and why it's perfect for the user's mood.
            Structure the JSON string with key 'recommendations', and for each recommendation, include a 'recipe_name', 'cuisine', 'reason_for_recommendation' and 'menu_category' (appetizer, entree, dessert ..etc ).`;
        default:
            return '';
    }
};

async function processFoodIdentificationIntent(userIntent, imageKey, socket, userId) {
    try {
        let content;
        if (userIntent === 'identifyFood') {
            const foodName = await processFoodImage(imageKey, true);
            socket.userSession.lastImageIdentify = foodName;
            content = `The food in the image appears to be ${foodName}.`;
        } else {
            const ingredients = await processFoodImage(imageKey, false);
            socket.userSession.lastImageIdentify = ingredients;
            content = `The ingredients in the image appear to be ${ingredients}.`;
        }

        const message = {
            role: 'assistant',
            content: content,
            timestamp: Date.now(),
        };

        await saveMessageHistory(userId, message);
        
        return {
            role: 'assistant',
            content: content,
            type: 'normal',
        };
    } catch (err) {
        console.log('Error processing food identification intent', err);
    }
    return null;
};

async function processRecipeIntent(userId, userIntent, parsedMessage) {
    console.log('Processing user intent:', userIntent);
    console.log('parsedMessage:', parsedMessage);
    try {
        let message;
        switch (userIntent) {
            case 'createNewRecipe':
                // The new recipe based on user input is already included in the parsedMessage
                const imageUrl = await retryFunction(generateImageFromDallePrompt, [parsedMessage.dalle_prompt]);

                const foodObejctNew = {
                    title: parsedMessage.recipe_name,
                    category: 'AI',
                    cuisine: 'AI',
                    ai_generated: true,
                    meta: {
                        imageUrl: imageUrl,
                        ...parsedMessage
                    },
                };

                const aiFood = new Food(foodObejctNew);
                await aiFood.save();

                message = {
                    role: 'assistant',
                    content: `Here's your new recipe: ${JSON.stringify(parsedMessage)}`,
                    timestamp: Date.now(),
                };
        
                await saveMessageHistory(userId, message);

                return {
                    role: 'assistant',
                    content: `Here's your new recipe:`,
                    type: 'recipe',
                    recipe: parsedMessage,
                    imageUrl: imageUrl,
                    timestamp: Date.now(),
                    foodId: aiFood._id,
                };
                break;
            case 'recipeQuestion':
                const searchResults = await searchFoodImage(parsedMessage.recipe_name);
                const bestMatch = searchResults.find(result => result.title.toLowerCase().includes(parsedMessage.recipe_name.toLowerCase()));
                const imageUrlGoogle = bestMatch ? bestMatch.imageUrl : (searchResults[0] ? searchResults[0].imageUrl : null);

                const foodObejct = {
                    title: parsedMessage.recipe_name,
                    category: parsedMessage.menu_category,
                    cuisine: parsedMessage.cuisine,
                    ai_generated: false,
                    meta: {
                        imageUrl: imageUrlGoogle,
                        ...parsedMessage
                    },
                };

                const food = new Food(foodObejct);
                await food.save();

                message = {
                    role: 'assistant',
                    content: `Here's the recipe: ${JSON.stringify(parsedMessage)}`,
                    timestamp: Date.now(),
                };
        
                await saveMessageHistory(userId, message);

                return {
                    role: 'assistant',
                    content: `Here's the recipe:`,
                    type: 'recipe',
                    recipe: parsedMessage,
                    imageUrl: imageUrlGoogle,
                    timestamp: Date.now(),
                    foodId: food._id,
                };
        }
    } catch (err) {
        console.log('Error processing user intent', err);
    }
    return null;
};

async function processRecommendationsIntent(userId, recommendations) {
    console.log('processRecommendationsIntent: ', recommendations);
    const recommendationMessages = await Promise.all(
        recommendations.map(async rec => {
            const searchResults = await searchFoodImage(rec.recipe_name);
            const bestMatch = searchResults.find(result => result.title.toLowerCase().includes(rec.recipe_name.toLowerCase()));
            const imageUrlGoogle = bestMatch ? bestMatch.imageUrl : (searchResults[0] ? searchResults[0].imageUrl : null);

            const foodObejct = {
                title: rec.recipe_name,
                category: rec.menu_category,
                cuisine: rec.cuisine,
                ai_generated: false,
                meta: {
                    imageUrl: imageUrlGoogle,
                    ...rec
                },
            };

            const food = new Food(foodObejct);
            await food.save();

            return {
                recipe_name: rec.recipe_name,
                cuisine: rec.cuisine,
                reason_for_recommendation: rec.reason_for_recommendation,
                menu_category: rec.menu_category,
                imageUrl: imageUrlGoogle,
                foodId: food._id,
            };
        })
    );

    const message = {
        role: 'assistant',
        content: `Here are some recommendations: ${JSON.stringify(recommendationMessages)}`,
        timestamp: Date.now(),
    };

    await saveMessageHistory(userId, message);

    return {
        role: 'assistant',
        content: 'Here are some recommendations:',
        type: 'recommendations',
        recommendations: recommendationMessages,
        timestamp: Date.now()
    };
};

async function uploadImageToS3(image, intent = 'normal', bucket = 'moodfood-chefai') {
    console.log('Uploading image to S3...');

    let bufferData, mimetype, acl;

    // Check if image is a URL
    if (image.startsWith('http')) {
        const response = await axios.get(image, { responseType: 'arraybuffer' });
        bufferData = Buffer.from(response.data, 'base64');
        mimetype = response.headers['content-type'];
        acl = 'public-read';
    } else {
        bufferData = Buffer.from(image.split(',')[1], 'base64');
        mimetype = image.match(/data:([^;]+);/)[1];
        acl = 'private';
    }

    const params = {
        Bucket: bucket,
        Key: Date.now().toString() + '-' + intent,
        Body: bufferData,
        ContentType: mimetype,
        ACL: acl,
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return { imageUrl: uploadResult.Location, imageKey: uploadResult.Key };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('An unexpected error occurred. Please try again later.');
    }
};


async function retryFunction(callback, args, maxRetries = 5, retryDelay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await callback(...args);
        } catch (error) {
            if (error.response && error.response.status === 504) {
                console.log('Request failed with status code 504, retrying...');
                await sleep(retryDelay * Math.pow(2, i));
            } else {
                console.error('Error executing function:', error);
                console.error('Error message:', error.message);
                break;
            }
        }
    }

    console.log('Exceeded maximum number of retries');
};

async function getAIResponse(completionParams) {
    try {
        const openai = new OpenAIApi(configuration);
        const openaiRateLimiter = new OpenAIRateLimiter(20 / 60);

        const response = await openaiRateLimiter.execute(async () => {
            return await openai.createChatCompletion(completionParams, { stream: true });
        });

        return response;
    } catch (err) {
        // console.error('Error getting AI response', err);
        if (err.response && err.response.data) {
            console.error('API error details:', err.response.data);
        }
    }
};

async function generateImageFromDallePrompt(prompt) {
    try {
        const result = await retryFunction(async (prompt) => {
            const openaiRateLimiter = new OpenAIRateLimiter(50 / 60); // 50 requests per minute
            const openai = new OpenAIApi(configuration);

            const response = await openaiRateLimiter.execute(async () => {
                return await openai.createImage({
                    prompt: prompt,
                    n: 1,
                    size: "512x512",
                });
            });

            const generatedImageURL = response.data.data[0].url;
            const { imageUrl } = await uploadImageToS3(generatedImageURL, 'dalle', 'moodfood-ai-generated');
            return imageUrl;
        }, [prompt]);

        return result;
    } catch (error) {
        console.error("Error generating image from DALL-E with retries:", error);
    }
};

async function getAssistantMessage(completionParams, socket) {
    const aiResponse = await getAIResponse(completionParams);
    let assistantMessage = aiResponse.data.choices[0].message;
    console.log('assistantMessage', assistantMessage);
    const totalTokens = aiResponse.data.usage.total_tokens;
    console.log('Total tokens spent:', totalTokens);
    await updateUserTokens(socket, totalTokens);

    let parsedMessage,
        responseType = 'normal';

    const jsonRegex = /{[\s\S]*}/;
    const jsonMatch = assistantMessage.content.match(jsonRegex);

    if (jsonMatch) {
        const jsonString = jsonMatch[0];

        try {
            parsedMessage = JSON.parse(jsonString);
            if (parsedMessage.recipe_name && parsedMessage.ingredients && parsedMessage.directions) {
                console.log('Detected recipe in AI response');
                responseType = 'recipe';
            } else if (parsedMessage.recommendations) {
                console.log('Detected recommendations in AI response as JSON');
                responseType = 'recommendations';
            }
        } catch (err) {
            console.log('No valid json response detected in AI response assistantMessage');
        }
    }

    return { assistantMessage, responseType, parsedMessage, totalTokens };
};

function isValidResponse(responseType, intent, parsedMessage) {
    console.log('Validating response...');
    console.log('Response type:', responseType);
    console.log('Intent:', intent);
    console.log(typeof parsedMessage, parsedMessage);
    console.log('Parsed message:', parsedMessage);
    if (responseType === 'recipe') {
        const baseRecipeKeys = ['recipe_name', 'ingredients'];
        const isRecipeValid = baseRecipeKeys.every(key => key in parsedMessage) &&
                              ('directions' in parsedMessage || 'instructions' in parsedMessage);
    
        if (intent === 'createNewRecipe') {
            return isRecipeValid && 'dalle_prompt' in parsedMessage;
        } else if (intent === 'recipeQuestion') {
            const additionalKeys = ['cuisine', 'menu_category'];
            return isRecipeValid && additionalKeys.every(key => key in parsedMessage);
        }
    } else if (responseType === 'recommendations') {
        const recommendationKeys = ['recipe_name', 'cuisine', 'reason_for_recommendation', 'menu_category'];

        // Check if the recommendations key exists in the parsedMessage
        if (!('recommendations' in parsedMessage)) {
            return false;
        }

        // Iterate through each recommendation object and check if all required keys are present
        return parsedMessage.recommendations.every(recommendation => 
            recommendationKeys.every(key => key in recommendation)
        );
    }

    return false;
};

async function getLastAssistantUserMessage(userId) {
    // Fetch the latest conversation for the user
    const conversation = await MessagesAI.findOne({ user: userId }, { messages: { $slice: -10 } }).sort({ createdAt: -1 });
    if (!conversation) {
        console.error('No conversation found for this user.');
    }

    // Reverse the messages so we can find the latest ones
    const reversedMessages = [...conversation.messages].reverse();
    // Find the last assistant message
    const lastAssistantMessage = reversedMessages.find(message => message.role === 'assistant');
    // Find the last user message
    const lastUserMessage = reversedMessages.find(message => message.role === 'user');
    // Return both messages
    return { lastAssistantMessage, lastUserMessage };
};

exports.chatAgent = async (socket, message) => {
    // Check if the user has reached their daily token limit
    const canLookupOpenAI = await shouldLookupOpenAI(socket.user);
    if (!canLookupOpenAI) {
        socket.emit('error', { reason: 'limit', error: 'You have reached your daily token limit. Please wait for your tokens to reset or upgrade your subscription.' });
        return;
    }
    // Reset user session if the user has been inactive for 10 minutes
    const SESSION_RESET_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    if (userTimeouts.has(socket.userId)) {
        clearTimeout(userTimeouts.get(socket.userId));
    }

    const timeoutId = setTimeout(() => {
        resetUserSession(socket);
        userTimeouts.delete(socket.userId);
    }, SESSION_RESET_TIMEOUT);

    userTimeouts.set(socket.userId, timeoutId);

    try {
        const { content } = message;

        let messages = [];

        // Include the last assistant and user messages from the user's conversation history
        const { lastAssistantMessage, lastUserMessage } = await getLastAssistantUserMessage(socket.userId);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000); // 10 minutes in milliseconds
        if (lastUserMessage && lastUserMessage.timestamp >= tenMinutesAgo) {
            messages.push({ role: 'user', content: lastUserMessage.content });
        }
        if (lastAssistantMessage && lastAssistantMessage.timestamp >= tenMinutesAgo) {
            messages.push({ role: 'assistant', content: lastAssistantMessage.content });
        }

        // Include the last image info identified from the user's session if it exists
        if (socket.userSession.lastImageIdentify) {
            messages.push({ role: 'user', content: `The image content I uploaded is/are: ${socket.userSession.lastImageIdentify}` });
        }

        const systemMessage = `As an AI chef, respond with "intent" and "response" where intent could be any of: recipeQuestion, foodRecommendations, createNewRecipe, imageIdentifyFood, imageIdentifyFoodIngredients.`;
        // Include the System message
        messages.push({ role: 'system', content: systemMessage });

        const recipeKeywords = ['recipe', 'cook', 'prepare', 'how to make', 'cooking instructions', 'steps to make'];
        const isRecipeQuestion = (content) => {
            return recipeKeywords.some(keyword => content.toLowerCase().includes(keyword));
        };
        if (isRecipeQuestion(content)) {
            socket.userSession.intent = 'recipeQuestion';
            await saveUserSession(socket);
        }

        let MAX_TOKENS = 1500;
        const AI_MODEL = 'gpt-3.5-turbo';
        // Check for intent in cookies and include the follow-up message if it exists
        if (socket.userSession.intent) {
            console.log('Detected initial intent:', socket.userSession.intent);
            const intent = socket.userSession.intent;

            // Include follow-up system message and increase max tokens
            MAX_TOKENS = 2048;
            const followUpSystemMessage = getFollowUpSystemMessage(intent);
            if (followUpSystemMessage) {
                messages.push({ role: 'system', content: followUpSystemMessage });
            }

            // Check if the user has uploaded an image and process it accordingly
            if (message.image && (intent === 'imageIdentifyFood' || intent === 'imageIdentifyFoodIngredients')) {
                console.log('Processing image for intent:', intent);
                const { imageKey } = await uploadImageToS3(message.image, intent);
                const foodIdentificationMessage = await processFoodIdentificationIntent(intent, imageKey, socket);
                socket.emit('message', { message: foodIdentificationMessage });
                // Update user tokens and save message history
                const totalTokens = 100; // TODO: Get the actual number of tokens used
                await updateUserTokens(socket, totalTokens);
                await saveMessageHistory(socket.userId, foodIdentificationMessage);
                await saveMessageHistory(socket.userId, { role: 'user', content: `The image content I uploaded is/are: ${socket.userSession.lastImageIdentify}`, type: 'image', timestamp: Date.now() });

                return;
            }
        }

        // Include the current user message
        messages.push({ role: 'user', content: content });

        // Save the user's message
        await saveMessageHistory(socket.userId, { role: 'user', content: content, type: 'normal', timestamp: Date.now() });        

        const completionParams = {
            model: AI_MODEL,
            messages: messages.map((message) => ({ role: message.role, content: message.content })),
            max_tokens: MAX_TOKENS,
            temperature: 0.1,
        };
        console.log('completionParams', completionParams);

        let { assistantMessage, responseType, parsedMessage, totalTokens } = await getAssistantMessage(completionParams, socket);
        let intentMatch,
        responseMatch,
        intent,
        response;
        
        // Continue processing the response
        switch (responseType) {
            case 'recipe':
                console.log('Processing user intent recipe');
                if (!isValidResponse(responseType, socket.userSession.intent, parsedMessage)) {
                    console.log('Invalid response detected. Re-running the AI.');
                    ({ assistantMessage, responseType, parsedMessage, totalTokens } = await getAssistantMessage(completionParams, socket));
                }
                const userIntentMessage = await processRecipeIntent(socket.userId, socket.userSession.intent, parsedMessage);
                socket.emit('message', { message: { ...userIntentMessage }, newTokens: socket.user.tokens });
                // Clear the intent from the user's session
                await resetUserSession(socket);
                await saveMessageHistory(socket.userId, userIntentMessage);
                break;
            case 'recommendations':
                console.log('Processing user intent recommendations');
                if (!isValidResponse('recommendations', socket.userSession.intent, parsedMessage)) {
                    console.log('Invalid response detected. Re-running the AI.');
                    ({ assistantMessage, responseType, parsedMessage, totalTokens } = await getAssistantMessage(completionParams, socket));
                }                
                // const recommendationsMessage = await processRecommendationsIntent(socket.userId, parsedMessage.recommendations);
                socket.emit('message', { message: parsedMessage.recommendations, newTokens: socket.user.tokens }); // socket.emit('message', { message: recommendationsMessage, newTokens: socket.user.tokens });
                // Clear the intent from the user's session
                await resetUserSession(socket);
                await saveMessageHistory(socket.userId, recommendationsMessage);
                break;
            case 'normal':
            default:
                console.log('Processing user intent normal/default, trying to detect intent');
                // Check if the content contains an intent and response
                const intentRegex = /(?:^|\n)Intent:\s*([\w-]+)(?:\n|$)/i;
                const responseRegex = /(?:^|\n)Response:\s*([\s\S]*?)(?:\n\n|$)/i;
                intentMatch = assistantMessage.content.match(intentRegex);
                responseMatch = assistantMessage.content.match(responseRegex);

                if (intentMatch && responseMatch) {
                    intent = intentMatch[1].trim();
                    console.log(`Detected intent in AI response ${intent}`);
                    response = responseMatch[1].trim();
                    // Store the intent and response in the user's session
                    socket.userSession.intent = intent;
                    socket.userSession.response = JSON.stringify({ intent, response });
                    await saveUserSession(socket);

                    console.log('No ingredients or instructions detected in response');

                    const responseWithoutLabel = response.replace(/response:\s*/i, '');
                    socket.emit('message', { message: { role: 'assistant', content: responseWithoutLabel }, newTokens: socket.user.tokens });

                } else {
                    // Send the assistant's message to the user
                    socket.emit('message', { message: { role: 'assistant', content: assistantMessage.content, type: 'normal', timestamp: Date.now() }, newTokens: socket.user.tokens });
                    await saveMessageHistory(socket.userId, { role: 'assistant', content: assistantMessage.content, type: 'normal', timestamp: Date.now() });
                }
                await saveMessageHistory(socket.userId, assistantMessage);
                break;
        }
    } catch (err) {
        console.error('Error in chatAgent function:', err);
        if (err.error && err.error.type === 'server_error') {
            socket.emit('error', { reason: 'server_overload', error: 'Our servers are currently overloaded. Please try again later.' });
        } else {
            socket.emit('error', { reason: 'unknown', error: 'An unknown error occurred. Please try again later.' });
        }
    }
};

