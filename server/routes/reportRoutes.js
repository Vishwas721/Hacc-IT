// File: server/routes/reportRoutes.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Op, sequelize } = require('sequelize'); // Correctly import sequelize
const { Report, User } = require('../models');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Import both middlewares

const router = express.Router();

// --- Cloudinary & Multer Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'civic-reports', format: 'png' },
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// POST /api/reports - Create a new report (Protected)
router.post('/', [upload.single('image'), protect], async (req, res) => {
    try {
        const { description, longitude, latitude } = req.body;
        const loggedInUserId = req.user.id; // Get the user ID from the token

        if (!description || !longitude || !latitude || !req.file) {
            return res.status(400).json({ error: 'Missing required fields or image.' });
        }
        
        let category = 'Other', urgency_score = 1;
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `Analyze the civic issue report text. Provide a JSON object with "category" and "urgency_score".
                Valid categories: 'Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Public Safety', 'Other'.
                Urgency score: a number from 1 (low) to 5 (high).
                Text: "${description}"
                JSON Response:`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);
                category = aiResponse.category || 'Other';
                urgency_score = aiResponse.urgency_score || 1;
            } catch (aiError) {
                console.error("AI analysis failed, using default values. AI Error:", aiError.message);
            }
        }

        const initialHistory = [{ status: 'Submitted', timestamp: new Date(), notes: 'Report received from citizen.' }];
        const location = { type: 'Point', coordinates: [longitude, latitude] };

        const newReport = await Report.create({
            description,
            imageUrl: req.file.path,
            location,
            UserId: loggedInUserId, // Use the ID of the user who is actually logged in
            category,
            urgency_score,
            status: 'Submitted',
            statusHistory: initialHistory,
        });

        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report.' });
    }
});

// GET /api/reports - Get all reports (For Admins)
router.get('/', [protect, adminOnly], async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search) {
            whereClause = { description: { [Op.iLike]: `%${search}%` } };
        }
        const reports = await Report.findAll({
            where: whereClause,
            include: User,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
});

// GET /api/reports/stats - Get report statistics
router.get('/stats', [protect, adminOnly], async (req, res) => {
    try {
        const total = await Report.count();
        const pending = await Report.count({ where: { status: { [Op.iLike]: 'Pending' } } });
        const resolved = await Report.count({ where: { status: { [Op.iLike]: 'Resolved' } } });
        const inProgress = await Report.count({ where: { status: { [Op.iLike]: 'In Progress' } } });
        res.json({ total, pending, resolved, inProgress });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch report stats.' });
    }
});

// GET /api/reports/by-category - Get reports grouped by category for the chart
router.get('/by-category', [protect, adminOnly], async (req, res) => {
    try {
        const categoryData = await Report.findAll({
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['category'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });
        res.json(categoryData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category data.' });
    }
});

// GET /api/reports/my-reports - Get reports for the currently logged-in user
router.get('/my-reports', protect, async (req, res) => {
    try {
        const reports = await Report.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']],
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user reports.' });
    }
});

// GET /api/reports/:id - Get a single report by ID (Protected)
router.get('/:id', protect, async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found.' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch report.' });
    }
});

// PUT /api/reports/:id - Update a report's status (Protected)
router.put('/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const io = req.app.get('socketio');
        const report = await Report.findByPk(req.params.id, { include: User }); // Include User to get their ID

        if (!report) return res.status(404).json({ error: 'Report not found.' });
        
        const newHistoryEntry = { status, timestamp: new Date(), notes: `Status updated by admin.` };
        
        report.status = status;
        report.statusHistory = [...report.statusHistory, newHistoryEntry];
        
        await report.save();
        
        io.emit('report-updated', report);
        
        res.status(200).json(report);
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: 'Failed to update report.' });
    }
});

module.exports = router;