// models/ChatSession.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    session: {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastActivity: { type: Date, default: Date.now },
    },
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
