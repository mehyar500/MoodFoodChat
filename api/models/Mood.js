const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  filters: {
    type: [String],
    required: true,
  },
  emotions: {
    type: [String],
  },
  recommendations: [
    {
      foodCategory: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true
      },
      cuisine: {
        type: String,
        required: false
      },
      meta: {
        type: Object,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

moodSchema.index({ userId: 1, message: 1 }, { unique: true });

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;
