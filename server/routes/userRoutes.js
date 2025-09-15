// File: server/routes/userRoutes.js
const express = require('express');
const { User } = require('../models');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/users - Get all users (Super Admin only)
router.get('/', [protect, adminOnly], async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Never send passwords
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// PUT /api/users/:id/role - Update a user's role (Super Admin only)
// File: server/routes/userRoutes.js

// PUT /api/users/:id/role - Update a user's role (Super Admin only)
router.put('/:id/role', [protect, adminOnly], async (req, res) => {
    try {
        const { role } = req.body;
        const targetUserId = req.params.id;
        const adminUserId = req.user.id; // The logged-in admin performing the action

        // Rule 1: Prevent promoting anyone to 'super-admin'
        if (role === 'super-admin') {
            return res.status(403).json({ error: 'Cannot promote a user to super-admin.' });
        }

        // Rule 2: Prevent an admin from changing their own role
        if (Number(targetUserId) === adminUserId) {
            return res.status(403).json({ error: 'Admins cannot change their own role.' });
        }

        const user = await User.findByPk(targetUserId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        user.role = role;
        await user.save();
        
        const { password, ...userWithoutPassword } = user.get();
        res.json(userWithoutPassword);

    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});

module.exports = router;