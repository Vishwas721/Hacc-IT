// File: server/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
// We need to import our middleware for the secure route
const { protect, municipalAdminOnly } = require('../middleware/authMiddleware'); 

const router = express.Router();

// --- SECURE: Get user profile ---
router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});

// --- NEW (PUBLIC): Citizen Registration (for Mobile App) ---
// This route is public but HARD-CODES the role to 'citizen' for security.
router.post('/register/citizen', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: 'citizen', // Role is hard-coded
        });

        res.status(201).json({ message: 'Citizen account created', userId: newUser.id });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Error registering new citizen.', details: error.message });
    }
});

// --- NEW (SECURE): Admin/Staff Registration (for Admin Dashboard) ---
// This route is protected and can only be accessed by a logged-in Municipal Admin.
router.post('/register/admin', [protect, municipalAdminOnly], async (req, res) => {
    try {
        const { username, password, role, departmentId } = req.body;

        // Server-side check to prevent creating invalid roles
        if (!['dept-admin', 'staff'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified. Can only create "dept-admin" or "staff".' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role,
            DepartmentId: departmentId || null,
        });

        res.status(201).json({ message: 'User account created successfully', userId: newUser.id });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Error creating new user.', details: error.message });
    }
});

// --- Your existing Login route (no changes needed) ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

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