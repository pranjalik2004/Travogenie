const express = require('express');
const {
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    getMyWishlist
} = require('../controller/WishlistController.js'); // Correct path
const authMiddleware = require("../middlware/auth.js"); // Correct path

const WishlistRouter = express.Router();

// Apply auth middleware TO THE WISHLIST ROUTES
WishlistRouter.use(authMiddleware);

WishlistRouter.post('/add', addToWishlist);
WishlistRouter.delete('/remove/:spotId', removeFromWishlist);
WishlistRouter.get('/check/:spotId', checkWishlistStatus);
WishlistRouter.get('/my', getMyWishlist);

module.exports = WishlistRouter;