// Inside server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

// --- 1. SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// --- 2. DATABASE CONNECTION ---
// --- 2. DATABASE CONNECTION ---
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Let sequelize know we're using PostgreSQL
  }
);

const connectToDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to database has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

connectToDb();
// --- 3. ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Civic Reporting API!' });
});

// --- 4. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});