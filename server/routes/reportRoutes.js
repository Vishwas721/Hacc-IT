const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Op, sequelize } = require('sequelize');
const { Report, User } = require('../models');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Cloudinary & Multer Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

// POST /api/reports - Create a new report
router.post('/', [protect, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image file is required.' });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, { folder: "civic-reports" });
        
        const { description, longitude, latitude } = req.body;
        const loggedInUserId = req.user.id;
        
        let category = 'Other', urgency_score = 1;
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `Analyze: "${description}". Return JSON with "category" (one of: 'Pothole', 'Streetlight', 'Garbage', 'Other') and "urgency_score" (1-5).`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);
                category = aiResponse.category || 'Other';
                urgency_score = aiResponse.urgency_score || 1;
            } catch (aiError) { console.error("AI analysis failed:", aiError.message); }
        }

        const initialHistory = [{ status: 'Submitted', timestamp: new Date(), notes: 'Report received from citizen.' }];
        const location = { type: 'Point', coordinates: [longitude, latitude] };

        const newReport = await Report.create({
            description,
            imageUrl: cloudinaryResponse.secure_url,
            location,
            UserId: loggedInUserId,
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

// PUT /api/reports/:id - Update a report's status
router.put('/:id', [protect, upload.single('resolvedImage')], async (req, res) => {
    try {
        const { status, resolvedNotes } = req.body;
        const io = req.io;
        const report = await Report.findByPk(req.params.id, { include: User });

        if (!report) return res.status(404).json({ error: 'Report not found.' });
        
        const newHistoryEntry = { status, timestamp: new Date(), notes: resolvedNotes || `Status updated to "${status}" by admin.` };
        
        report.status = status;
        
        if (status === 'Resolved' && req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, { folder: "civic-reports-resolved" });
            report.resolvedImageUrl = cloudinaryResponse.secure_url;
            report.resolvedNotes = resolvedNotes;
        }
        
        report.statusHistory = [...report.statusHistory, newHistoryEntry];
        await report.save();
        
        io.emit('report-updated', report.toJSON());
        
        res.status(200).json(report);
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: 'Failed to update report.' });
    }
});

// --- ALL GET ROUTES ---
// GET /api/reports - Get all reports (For Admins)
router.get('/', [protect, adminOnly], async (req, res) => {
    try {
        const reports = await Report.findAll({ include: User, order: [['createdAt', 'DESC']] });
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
// in server/routes/reportRoutes.js

// PUT /api/reports/:id - Update a report's status (Protected)
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

module.exports = router;