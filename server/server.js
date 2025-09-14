require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectAndSync } = require('./db');
const reportRoutes = require('./routes/reportRoutes');

// --- SETUP ---
const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

const PORT = process.env.PORT || 8080;

// Connect to DB and sync models
connectAndSync();

// --- ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Civic Reporting API!' });
});

// Use our new report routes
app.use('/api/reports', reportRoutes);


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});