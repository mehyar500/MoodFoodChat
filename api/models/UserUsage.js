// models/UserUsage.js
const mongoose = require('mongoose');

const userUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moodCreations: [
    {
      timestamp: {
        type: Date,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('UserUsage', userUsageSchema);
