const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  intent: { type: String, default: null },
  response: { type: String, default: null },
  lastActivity: { type: Date, default: Date.now },
  messages: [{
    role: { type: String },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
});

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: false },
  subscription: { type: Object },
  meta: { type: Object },
  preference: { type: Object },
  stripeSubscriptionId: { type: String },
  subscriptionType: {
    type: String,
    enum: ['free', 'premium'],
    required: true,
  },
  tokens: { type: Number, default: 100000 },
  tokensUpdatedAt: { type: Date, default: null },
  session: SessionSchema,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
