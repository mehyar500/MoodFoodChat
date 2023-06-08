// socketRoutes.js
const User = require('./models/User');
const moodfoodaiControllerV3 = require('./controllers/moodfoodaiControllerV3');
const { loadOrCreateSession, resetUserSession, saveUserSession } = require('./sessionStore');

// 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

async function socketMiddleware(socket, next) {
  try {
      const userId = socket.handshake.query.userId;
      if (!userId) {
          return next(new Error('Unauthorized'));
      }
      
      const user = await User.findOne({ _id: userId });
      
      if (!user) {
          return next(new Error('Invalid access userId.'));
      }
      
      socket.user = user;
      socket.userId = user._id;

      next();
  } catch (error) {
      console.error('Unexpected error in socket middleware:', error);
      next(error);
  }
};

module.exports.setupChatNamespace = (io) => {
  const chatNamespace = io.of('/api/chat');

  chatNamespace.use(socketMiddleware);

  chatNamespace.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    try {
      socket.session = await loadOrCreateSession(socket);
      socket.session.lastActivity = Date.now();
      await saveUserSession(socket.userId, socket.session);
      
      socket.on('message', async (message) => {
        try {
          if (Date.now() - socket.session.lastActivity > INACTIVITY_TIMEOUT) {
            await resetUserSession(socket);
            socket.session = await loadOrCreateSession(socket);
          }
          await saveUserSession(socket.userId, socket.session);
          moodfoodaiControllerV3.chatAgent(socket, message);
        } catch (err) {
          console.error('Error in message event:', err);
          socket.emit('error', { reason: 'unknown', error: 'An error occurred while processing your message. Please try again later.' });
        }
      });

      socket.on('disconnect', async (reason) => {
        console.log('User disconnected:', socket.id, 'Reason:', reason);
        if (socket.disconnected && socket.session) {
          await saveUserSession(socket.userId, socket.session);
        }
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err);
      });
    } catch (err) {
      console.error('Error during connection:', err);
      socket.emit('error', { reason: 'unknown', error: 'An error occurred while setting up your connection. Please try again later.' });
    }
});

};
