const MessagesAI = require('../models/MessagesAI');
const { resetUserSession, saveUserSession } = require('../sessionStore');
const { getTokenCount } = require('../utils/tokenCounter');
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory } = require("langchain/memory");
const { DynamoDBChatMessageHistory } = require("langchain/stores/message/dynamodb");

require('dotenv').config();

const userTimeouts = new Map();

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

async function getAssistantMessage(userMessage, socket) {
    try {
        const memory = new BufferMemory({
            chatHistory: new DynamoDBChatMessageHistory({
              tableName: "langchain",
              partitionKey: "id",
              sessionId: socket.session._id.toString(),
              config: {
                region: "us-east-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                },
              },
            }),
        });
        const model = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo',
            temperature: 0.1,
            maxTokens: 500,
            streaming: true,
        });
        const chain = new ConversationChain({
            memory: memory,
            llm: model,
        });
        const aiResponse = await chain.call({ input: userMessage.content });
        console.log('AI response:', aiResponse);
        const aiMessage = { role: 'assistant', content: aiResponse.response, type: 'chat', timestamp: Date.now() };
        socket.emit('message', { message: aiMessage, newTokens: socket.user.tokens });
        socket.session.lastActivity = Date.now();
        // Save the context to the database
        await memory.saveContext({input: userMessage.content}, {output: aiResponse.response});

        // Calculate the total tokens used.
        const tokensInUserMessage = await getTokenCount(userMessage.content);
        const tokensInAiResponse = await getTokenCount(aiResponse.response);
        const totalTokens = tokensInUserMessage + tokensInAiResponse;

        return { assistantMessage: aiMessage , totalTokens: totalTokens };

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