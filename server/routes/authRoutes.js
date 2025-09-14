// File: server/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Adjusted path to models
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// --- Register a new user ---
// POST /api/auth/register
router.get('/profile', protect, (req, res) => {
    // The 'protect' middleware runs first. If the token is valid,
    // it attaches the user data to req.user.
    res.json(req.user);
});

router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'staff', // Default to 'staff' if no role is provided
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: 'Error registering new user.', details: error.message });
    }
});

// --- Login a user ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Compare submitted password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Passwords match, create a JWT
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Error logging in.', details: error.message });
    }
});

module.exports = router;