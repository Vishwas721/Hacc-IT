// File: server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    console.log('\n--- DEBUG: 1. Entering protect middleware ---');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('--- DEBUG: 2. Token found:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('--- DEBUG: 3. Token decoded successfully:', decoded);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            console.log('--- DEBUG: 4. User found in DB:', req.user ? req.user.toJSON() : 'null');

            if (req.user) {
                return next();
            } else {
                console.error('--- DEBUG: ERROR at step 4 --- Token is valid, but user ID not found in database.');
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

        } catch (error) {
            console.error('--- DEBUG: ERROR at step 3 --- Token verification failed.', error.message);
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.error('--- DEBUG: ERROR at step 2 --- No token or bearer header found.');
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'super-admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};

const managerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'super-admin' || req.user.role === 'dept-admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized for this action' });
    }
};

module.exports = { protect, adminOnly: managerOnly };