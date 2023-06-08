const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    ai_generated: {
        type: Boolean,
        default: false
    },
    meta: { type: Object },
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
