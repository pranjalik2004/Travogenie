const express = require("express");
const { registerUser, loginUser, getUserDetails, logoutUser, updateUser, updatePassword,findUserByEmail,getAllUsers } = require("../controller/userController.js");
const authMiddleware = require("../middlware/auth.js"); // ✅ Corrected import path

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// ✅ Secure route using authMiddleware
userRouter.get("/me", authMiddleware, getUserDetails);
userRouter.post("/logout", authMiddleware, logoutUser);

// ✅ Correct HTTP method for updating user profile
userRouter.put("/update", authMiddleware, updateUser);
userRouter.put('/change-password', authMiddleware, updatePassword);
userRouter.post('/find', findUserByEmail);

// Get all users
userRouter.get('/all', getAllUsers)

module.exports = userRouter;