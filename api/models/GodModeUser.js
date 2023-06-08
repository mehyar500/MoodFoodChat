// models/GodModeUser.js
const mongoose = require('mongoose');

const godModeUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('GodModeUser', godModeUserSchema);
