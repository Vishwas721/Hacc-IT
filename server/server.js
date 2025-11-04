require('dotenv').config();
const express = require('express');

const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const db = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

// --- SETUP ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: [
            'https://nagarikone.vercel.app',
            'https://nagarikone.onrender.com',
            'exp://' // Allow Expo development client
        ], 
        methods: ["GET", "POST", "PUT"] 
    }
});

// Make io instance available
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Configure CORS for Express
app.use(cors({
    origin: [
        'https://nagarikone.vercel.app',
        'https://nagarikone.onrender.com',
        'exp://' // Allow Expo development client
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);

// --- SOCKET.IO CONNECTION ---
io.on('connection', (socket) => {
  console.log('🔌 A user connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
});

// --- START SERVER ---
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});