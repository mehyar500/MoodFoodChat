// models/Cuisine.js
const mongoose = require('mongoose');

const CuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  meta: {
    type: Object,
  },
});

module.exports = mongoose.model('Cuisine', CuisineSchema);
