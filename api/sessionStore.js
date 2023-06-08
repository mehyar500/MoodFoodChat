// sessionStore.js
const ChatSession = require('./models/ChatSession');

async function loadOrCreateSession(socket) {
    let chatSession = await ChatSession.findOne({ userId: socket.userId });
  
    if (!chatSession) {
        console.log('No session found, creating new session.');
        chatSession = await createUserSession(socket.userId);
    }
  
    const loadedSession = chatSession.session;
    loadedSession._id = chatSession._id;
  
    return loadedSession;
};

async function saveUserSession(userId, session) {
    console.log(`Saving user session for userId: ${userId}`);
    try {
        const chatSession = await ChatSession.findOneAndUpdate({ _id: session._id, userId: userId }, { session }, { upsert: true, new: true });
        return chatSession._id;
    } catch (err) {
        console.error('Error while saving user session:', err);
    }
};

async function createUserSession(userId) {
    console.log(`Creating new user session for userId: ${userId}`);
    const newSession = {
        user: userId,
        lastActivity: Date.now(),
    };
    const chatSession = new ChatSession({ userId: userId, session: newSession });
    const savedChatSession = await chatSession.save();

    return {
        ...savedChatSession.session.toObject(),
        _id: savedChatSession._id
    };
};

async function resetUserSession(socket) {
    console.log(`Resetting user session for userId: ${socket.userId}`);
    const newSession = await createUserSession(socket.userId);
    socket.session = {
        ...newSession,
    }

    return newSession;
};

async function loadUserSession(userId, sessionId) {
    console.log(`Loading user session for userId: ${userId}`);
    const chatSession = await ChatSession.findOne({ _id: sessionId, userId: userId });
    if (!chatSession) {
        return null;
    }
    
    const loadedSession = chatSession.session;
    loadedSession._id = chatSession._id;

    return loadedSession;
};

module.exports = {
    loadUserSession,
    createUserSession,
    saveUserSession,
    resetUserSession,
    loadOrCreateSession,
};
