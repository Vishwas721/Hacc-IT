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
router.put('/:id/role', [protect, adminOnly], async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);

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