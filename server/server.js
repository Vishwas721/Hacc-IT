// File: server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models'); // The one and only way we import our DB

// Import all our route files
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
// --- SETUP ---
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// --- DATABASE SYNC ---
const syncDatabase = async () => {
    try {
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');
    } catch (error) {
        console.error('❌ Unable to synchronize the database:', error);
    }
};
syncDatabase();

// --- ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Civic Reporting API!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).json({ 
        error: "An unexpected error occurred on the server.",
        details: err.message 
    });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});