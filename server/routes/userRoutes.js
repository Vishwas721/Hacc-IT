const express = require('express');
const { Op } = require('sequelize');
const { User, Department } = require('../models');
// --- FIX: Import the new, correct middleware ---
const { protect, municipalAdminOnly } = require('../middleware/authMiddleware'); 
const router = express.Router();

// GET /api/users - Get all users 
// --- FIX: Use the correct 'municipalAdminOnly' middleware ---
router.get('/', [protect, municipalAdminOnly], async (req, res) => {
    try {
        const users = await User.findAll({
            // THIS IS THE NEW LOGIC:
            // It gets all users where the role is NOT 'citizen'
            where: {
                role: {
                    [Op.ne]: 'citizen'
                }
            },
            attributes: { exclude: ['password'] },
            include: [Department],
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// PUT /api/users/:id/role - Update a user's role
// --- FIX: Use the correct 'municipalAdminOnly' middleware ---
router.put('/:id/role', [protect, municipalAdminOnly], async (req, res) => {
    try {
        const { role, departmentId } = req.body;
        const targetUserId = req.params.id;
        const adminUserId = req.user.id; 

        // Prevent promoting to 'super-admin'
        if (role === 'super-admin') {
            return res.status(403).json({ error: 'Cannot promote a user to super-admin.' });
        }

        // Prevent an admin from changing their own role
        if (Number(targetUserId) === adminUserId) {
            return res.status(403).json({ error: 'Admins cannot change their own role.' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        
        user.role = role;
        user.DepartmentId = (role === 'dept-admin' || role === 'staff' || role === 'municipal-admin') ? departmentId : null;
        await user.save();
        
        const { password, ...userWithoutPassword } = user.get();
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});

module.exports = router;