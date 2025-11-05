// File: server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const db = require('./models'); // ✅ Uses the unified Sequelize setup (with SSL detection)

// Import routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

// --- EXPRESS + SOCKET SETUP ---
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://nagarikone.vercel.app',
      'https://hacc-it.onrender.com',
      'exp://', // Allow Expo dev client
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Make io instance available inside routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    'https://nagarikone.vercel.app',
    'https://hacc-it.onrender.com',
    'exp://',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- DATABASE CONNECTION + SYNC ---
(async () => {
  try {
    console.log('🧩 Attempting to connect to the database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
  } catch (error) {
    console.error('❌ Unable to connect or sync database:', error);
  }
})();

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
  console.error('💥 UNHANDLED ERROR:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
