// File: server/routes/userRoutes.js
const express = require('express');
const { User, Department } = require('../models');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/users - Get all users (Super Admin only)
router.get('/', [protect, adminOnly], async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [Department], // Include the department info for each user
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
        const { role, departmentId } = req.body;
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

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        
        user.role = role;
        // Assign department if the role is dept-admin or staff, otherwise null
        user.DepartmentId = (role === 'dept-admin' || role === 'staff') ? departmentId : null;
        await user.save();
        
        
        const { password, ...userWithoutPassword } = user.get();
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});

module.exports = router;