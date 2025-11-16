const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const User = require("../models/User.js");
const authMiddleware = require("../middleware/authMiddleware.js");  // JWT verify middleware

const router = express.Router();

// File @desc:
// - `POST /api/v1/auth/signup` → Register new user
// - `POST /api/v1/auth/login` → Login, return JWT
// - `GET /api/v1/auth/me` → Get logged-in user info (pfp, email, name)

const signupSchema = zod.object({
    name: zod.string(),
    email: zod.email(),
    password: zod.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(6, "Password must be at least 6 characters long")
});

// @route   POST /api/v1/auth/signup
// @desc    Register new user
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name, email, password);

        const parsed = signupSchema.safeParse({ name, email, password }); //Zod Checks
        if (!parsed.success) return res.status(400).json({ message: "Invalid Input", error: parsed.error.errors });

        const existingUser = await User.findOne({ email }); //Check if user already exists
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10); //Create and save new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });
        await user.save();

        // 4. Create JWT
        const token = jwt.sign({ id: user._id, userName: user.name}, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST /api/v1/auth/login
// @desc    Login user and return JWT
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const parsed = loginSchema.safeParse({ email, password }); //Zod Checks
        if (!parsed.success) return res.status(400).json({ message: "Invalid Input", error: parsed.error.errors });

        const user = await User.findOne({ email }); //Check if user exists
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password); //Check if the pasword is correct
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" }); //Sign JWT

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   GET /api/v1/auth/me
// @desc    Get logged-in user info
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password"); // exclude password
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;