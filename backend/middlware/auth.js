const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header("Authorization"); // ✅ Extract token correctly

        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized. Please log in again." });
        }

        // ✅ Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id; // ✅ Store user ID in req.user

        next(); // ✅ Move to the next middleware or route

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;