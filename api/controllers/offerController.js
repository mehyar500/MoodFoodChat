const Offer = require('../models/Offer');

exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().where('expiryDate').gt(Date.now()).sort('expiryDate');
        res.json({ offers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
