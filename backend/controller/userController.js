const userModel = require("../model/userModel.js");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

// Token Blacklist (Temporary, use Redis for production)
const blacklistedTokens = new Set();

// ✅ Generate JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ✅ Register User
const registerUser = async (req, res) => {
    const { name, email, password, c_password, phone, address, dob, gender } = req.body;

    try {
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        if (password !== c_password) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            dob,
            phone,
            address,
            gender
        });

        const user = await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully", user });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again" });
    }
};

// ✅ Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const findUserByEmail = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  const getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find({});
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

// ✅ Middleware to Verify Token
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified.id;  // ✅ Store only the user ID
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session Expired! Please log in again" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Invalid Token" });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

// ✅ Get User Details
const getUserDetails = async (req, res) => {
    try {
        const user = await userModel.findById(req.user).select("-password"); // ✅ Use req.user directly
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Logout User & Blacklist Token
const logoutUser = (req, res) => {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ message: "No token provided" });

    blacklistedTokens.add(token);
    res.json({ message: "Logged out successfully" });
};

// ✅ Middleware to Check Blacklisted Token
const isTokenBlacklisted = (req, res, next) => {
    const token = req.header("Authorization");
    if (blacklistedTokens.has(token)) {
        return res.status(401).json({ message: "Token expired, please log in again" });
    }
    next();
};

// ✅ Update User Profile
const updateUser = async (req, res) => {
    try {
        const { email, name, phone, address, gender } = req.body;

        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            { name, phone, address, gender },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully", updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// ✅ Update Password
const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await userModel.findById(req.user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Validate new password
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as the current password" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


module.exports = {
    loginUser,
    registerUser,
    getUserDetails,
    verifyToken,
    logoutUser,
    updateUser,
    isTokenBlacklisted,
    updatePassword,
    getAllUsers,
    findUserByEmail
};