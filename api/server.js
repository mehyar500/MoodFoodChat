// server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const routes = require('./routes');
const http = require('http');
const { Server } = require('socket.io');
const { setupChatNamespace } = require('./socketRoutes');

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  try {
    console.log('Starting server...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const allowedOrigins = [
      `${process.env.FRONTEND_BASE_URL}`,
      `${process.env.BACKEND_BASE_URL}`
    ];

    const app = express();

    app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    }));
    app.use(cookieSession({
      name: 'moodfood-api-session',
      keys: [process.env.COOKIE_KEY],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }));

    app.use(cookieParser());

    app.use('/api', (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err) {
          console.error('Error in multer middleware:', err);
          res.status(500).json({ error: 'An error occurred while uploading the image.' });
        } else {
          next();
        }
      });
    }, routes);

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      debug: true, // enable logging
      transports: ['websocket'],
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        debug: true,
        allowEIO3: true,
      },
      maxHttpBufferSize: 25e6, // 25 MB,
      pingTimeout: 30000, // maximum delay between pings before server considers the client disconnected
      pingInterval: 10000, // delay between each ping packet
    });    

    // Setup Socket.IO Namespaces
    setupChatNamespace(io);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });

    const PORT = process.env.PORT || 3030;
    httpServer.listen(PORT);
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error(`Error starting server: ${err}`);
  }
}

startServer();
