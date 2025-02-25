const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const registerUser = async (req, res) => {
    try {
        const { uid, name, email, phoneNumber } = req.body;
        if (!uid || !name || !email || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        User.findByEmail(email, (err, existingUser) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });
            if (existingUser.length > 0) {
                return res.status(400).json({ message: "User already exists. Please log in." });
            }

            const newUser = new User(uid, name, phoneNumber, email);
            newUser.save((saveErr) => {
                if (saveErr) return res.status(500).json({ message: "Database error", error: saveErr.message });
                res.status(200).json({ message: "User registered successfully in database." });
            });
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { uid, email } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ message: "UID and Email are required" });
        }

        User.findByEmail(email, (err, dbUser) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });
            if (dbUser.length === 0) return res.status(404).json({ message: "User not found in database." });

            const user = dbUser[0];

            const jwtToken = jwt.sign(
                { uid: user.uid, email: user.email, name: user.name },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                message: "Login successful",
                user: {
                    uid: user.uid,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    token: jwtToken,
                }
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
