const Food = require('../models/Food');
const MessagesAI = require('../models/MessagesAI');
const Summary = require('../models/Summary');
const OpenAIRateLimiter = require('../utils/OpenAIRateLimiter');
const { Configuration, OpenAIApi } = require("openai");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ConversationSummaryMemory } = require("langchain/memory");
const { HumanChatMessage, AIChatMessage, SystemChatMessage } = require("langchain/schema");
const { resetUserSession, saveUserSession } = require('../sessionStore');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

require('dotenv').config();

const userTimeouts = new Map();

async function retry(callback, args, retryOnStatusCodes = [504], maxRetries = 5, retryDelay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await callback(...args);
        } catch (error) {
            if (error.response && retryOnStatusCodes.includes(error.response.status)) {
                console.log(`Request failed with status code ${error.response.status}, retrying...`);
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

async function shouldLookupOpenAI(user) {
    const now = new Date();

    // Convert tokensUpdatedAt to a Date object
    const tokensUpdatedAt = new Date(user.tokensUpdatedAt);

    // Check if tokens need to be reset (e.g., every day)
    const tokensNeedReset =
        !tokensUpdatedAt || now - tokensUpdatedAt >= 24 * 60 * 60 * 1000;

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

async function updateUserTokens(socket, totalTokens) {
    try {
        socket.user.tokens -= totalTokens;
        socket.user.tokensUpdatedAt = new Date();
        await socket.user.save();

        return socket.user;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

async function saveChatHistory(userId, sessionId, message) {
    try {
        const newMessage = new MessagesAI({
            user: userId,
            session: sessionId,
            message: message
        });
        await newMessage.save();

    } catch (error) {
        console.error('Error while saving message history:', error);
    }
};

async function fetchChatHistory(userId, sessionId, limit) {
    try {
        const chatHistory = await MessagesAI
            .find({ user: userId, session: sessionId })
            .sort({ 'timestamp': -1 })
            .limit(limit)
            .exec();
        return chatHistory;
    } catch (error) {
        console.error('Error while fetching chat history:', error);
    }
};

async function getChatHistorySummary(latestSummary, chatHistory) {
    try {
        console.log('Getting chat history summary...');
        const memory = new ConversationSummaryMemory({
            memoryKey: "chat_history",
            llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
        });

        // Initialize an array to hold chat messages
        let chatMessages = [];

        for (let message of chatHistory) {
            // Convert each message to the correct format and add it to the array
            if (message.role === 'user') {
                chatMessages.push(new HumanChatMessage(message.content));
            } else if (message.role === 'assistant') {
                chatMessages.push(new AIChatMessage(message.content));
            } else if (message.role === 'system') {
                chatMessages.push(new SystemChatMessage(message.content));
            }
        }

        // Generate the chat history summary.
        const newSummary = await memory.predictNewSummary(chatMessages, latestSummary);
        console.log('New summary:', newSummary);
        return newSummary;
    } catch (err) {
        console.error('Error while summarizing the chat history:', err);
    }
};

async function getAssistantMessage(userMessage, socket) {
    try {
        let latestSummary, messages = [];
        const systemMessage = `You are an AI chef.`;
        console.log('socket.session:', socket.session);
        const chatHistory = await fetchChatHistory(socket.userId, socket.session._id, 10);

        if (chatHistory.length > 2) {
            console.log('messages length > 2');
            // Fetch the latest summary from the Summary collection for the current session
            latestSummary = await Summary.findOne({ user: socket.user._id, session: socket.session._id });

            if (latestSummary) {
                console.log('found latest summary', latestSummary);
                messages.push(
                    { role: 'system', content: systemMessage },
                    { role: 'system', content: latestSummary.summary },
                    { role: 'user', content: userMessage.content },
                );
            } else {
                messages.push(
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage.content },
                );
            }
        } else {
            messages.push(
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage.content },
            );
        }

        console.log('Messages:', messages);

        const completionParams = {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 1500,
            temperature: 0.1,
        };
        const openai = new OpenAIApi(configuration);
        const openaiRateLimiter = new OpenAIRateLimiter(20 / 60);

        const aiResponse = await retry(async () => {
            return await openaiRateLimiter.execute(() => openai.createChatCompletion(completionParams, { stream: true }));
        }, [], [429, 504], 5, 2000);
        console.log('AI response:', aiResponse.data);

        const aiMessage = { role: 'assistant', content: aiResponse.data.choices[0].message.content, type: 'chat', timestamp: Date.now() };

        // Emit the messages to the client
        socket.emit('message', { message: aiMessage, newTokens: socket.user.tokens });
        socket.session.lastActivity = Date.now();

        const newSumMessages = [chatHistory, userMessage, aiResponse.data.choices[0].message];
        const newSummary = await getChatHistorySummary(latestSummary, newSumMessages);

        await Summary.findOneAndUpdate(
            { user: socket.userId, session: socket.session._id },
            { summary: newSummary },
            { upsert: true, new: true, runValidators: true },
        );

        return { assistantMessage: aiMessage, totalTokens: aiResponse.data.usage.total_tokens };

    } catch (err) {
        if(err.data && err.data.error) {
            console.error('Error while getting assistant message:', err.data.error);
        } else {
            console.error('Error while getting assistant message:', err);
        }
    }
};

exports.chatAgent = async (socket, message) => {
    console.log('Chat agent called');
    const canLookupOpenAI = await shouldLookupOpenAI(socket.user);
    if (!canLookupOpenAI) {
        socket.emit('error', { reason: 'limit', error: 'You have reached your daily token limit. Please wait for your tokens to reset or upgrade your subscription.' });
        return;
    }

    const SESSION_RESET_TIMEOUT = 30 * 60 * 1000; // 30 minutes
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
        const userMessage = { role: 'user', content: content, type: 'chat', timestamp: Date.now() };
        const { assistantMessage, totalTokens } = await getAssistantMessage(userMessage, socket);
        // Update the user session in the database
        socket.session = await saveUserSession(socket.userId, socket.session);
        // Save the messages to the database
        await saveChatHistory(socket.userId, socket.session._id, userMessage);
        await saveChatHistory(socket.userId, socket.session._id, assistantMessage);        
        // Update the user's tokens
        await updateUserTokens(socket, totalTokens);
    } catch (err) {
        console.error('Error in chatAgent function:', err);
        socket.emit('error', { reason: 'unknown', error: 'An unknown error occurred. Please try again later.' });
    }
};