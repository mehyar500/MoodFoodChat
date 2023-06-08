const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SummarySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    summary: {
        type: String,
        required: true
    }
});

const Summary = mongoose.model('Summary', SummarySchema);

module.exports = Summary;
