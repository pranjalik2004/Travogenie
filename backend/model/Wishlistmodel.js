const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    spotId: {
        type: Schema.Types.ObjectId,
        ref: 'TouristSpot',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicates (user can't add same spot twice)
wishlistSchema.index({ userId: 1, spotId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
