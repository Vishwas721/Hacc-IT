const express = require('express');
const router = express.Router();
const { sequelize } = require('../db');

router.get('/db', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ 
            status: 'healthy',
            message: 'Database connection successful',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            message: error.message,
            timestamp: new Date().toISOString(),
            // Safe error details that don't expose credentials
            details: {
                code: error.original?.code,
                errorType: error.name,
                parent: error.parent ? {
                    name: error.parent.name,
                    code: error.parent.code
                } : null
            }
        });
    }
});

module.exports = router;