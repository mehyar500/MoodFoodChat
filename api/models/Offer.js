const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    source: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    imageUrl: { type: String, required: false },
});

module.exports = mongoose.model('Offer', offerSchema);
