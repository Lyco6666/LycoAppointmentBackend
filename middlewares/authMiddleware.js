const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized Access. No Token Provided" });
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;

        db.query("SELECT name, role FROM users WHERE uid = ?", [decodedToken.uid], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database Error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "User not found in database" });
            }

            req.user.name = result[0].name;
            req.user.role = result[0].role;
            next();
        });

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins Only" });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
