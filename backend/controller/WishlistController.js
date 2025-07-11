const Wishlist = require("../model/Wishlistmodel");
const TouristSpot = require('../model/touristSpotModel'); // Adjust path if needed
const mongoose = require('mongoose');

// @desc    Add a spot to the user's wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user; // ✅ Extracted from authMiddleware
        const { spotId } = req.body;

        if (!userId || !spotId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or spotId"
            });
        }

        // Optional: Check if already exists
        const exists = await Wishlist.findOne({ userId, spotId });
        if (exists) {
            return res.status(200).json({ success: true, message: "Already in wishlist" });
        }

        // Save to DB
        const newEntry = new Wishlist({ userId, spotId });
        await newEntry.save();

        return res.status(201).json({
            success: true,
            message: "Added to wishlist"
        });
    } catch (err) {
        console.error("Add to wishlist error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// @desc    Remove a spot from the user's wishlist
// @route   DELETE /api/wishlist/remove/:spotId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    const userId = req.user; // ✅ fixed here
    const { spotId } = req.params;

    if (!spotId || !mongoose.Types.ObjectId.isValid(spotId)) {
        return res.status(400).json({ success: false, message: 'Valid Spot ID is required.' });
    }

    try {
        const result = await Wishlist.findOneAndDelete({ userId, spotId });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Spot not found in wishlist.' });
        }

        res.status(200).json({ success: true, message: 'Spot removed from wishlist successfully.' });

    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error while removing from wishlist.' });
    }
};
// @desc    Check if a spot is in the user's wishlist
// @route   GET /api/wishlist/check/:spotId
// @access  Private
exports.checkWishlistStatus = async (req, res) => {
    const userId = req.user.id;
    const { spotId } = req.params;

     if (!spotId || !mongoose.Types.ObjectId.isValid(spotId)) {
        return res.status(400).json({ success: false, message: 'Valid Spot ID is required.' });
    }

    try {
        const wishlistItem = await Wishlist.findOne({ userId, spotId });

        res.status(200).json({ success: true, isInWishlist: !!wishlistItem }); // Convert result to boolean

    } catch (error) {
        console.error("Error checking wishlist status:", error);
        res.status(500).json({ success: false, message: 'Server error while checking wishlist status.' });
    }
};

// @desc    Get all spots in the current user's wishlist
// @route   GET /api/wishlist/my
// @access  Private
exports.getMyWishlist = async (req, res) => {
    const userId = req.user;

    try {
        // Find all wishlist items for the user AND populate the spot details
        const wishlistItems = await Wishlist.find({ userId })
            .populate({
                path: 'spotId', // The field in Wishlist model to populate
                model: TouristSpot, // The model to use for population
                // Select only the fields you need from the TouristSpot for the dashboard
                select: '_id location.name location.image_url location.description hotels nearby_attractions' // Adjust fields as needed!
            })
            .sort({ addedAt: -1 }); // Optional: sort by newest first

        // Filter out items where spotId might be null if a spot was deleted but wishlist item remained (optional cleanup)
        const validWishlistItems = wishlistItems.filter(item => item.spotId !== null);

        res.status(200).json({ success: true, wishlist: validWishlistItems });

    } catch (error) {
        console.error("Error fetching user's wishlist:", error);
        res.status(500).json({ success: false, message: "Server error while fetching wishlist." });
    }
};