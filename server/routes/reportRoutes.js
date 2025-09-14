// File: server/routes/reportRoutes.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Op } = require('sequelize'); // Import Sequelize operators ONCE
const { Report, User } = require('../models');

const router = express.Router();

// --- AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// --- Cloudinary & Multer Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic-reports',
        format: 'png',
    },
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// POST a new report (with AI analysis)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { description, longitude, latitude, userId } = req.body;
        if (!description || !longitude || !latitude || !req.file) {
            return res.status(400).json({ error: 'Missing required fields or image.' });
        }
        let category = 'Other', urgency_score = 1;
        try {
            const prompt = `Analyze the following civic issue report text. Based on the text, provide a JSON response with "category" and "urgency_score".
            Categories must be one of: 'Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Public Safety', 'Other'.
            Urgency score must be a number from 1 (low) to 5 (high), based on words like 'dangerous', 'urgent', 'immediately'.
            Text: "${description}"
            JSON Response:`;
            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();
            const aiResponse = JSON.parse(responseText);
            category = aiResponse.category || 'Other';
            urgency_score = aiResponse.urgency_score || 1;
        } catch (aiError) {
            console.error("AI analysis failed, using default values.", aiError);
        }
        const location = { type: 'Point', coordinates: [longitude, latitude] };
        const newReport = await Report.create({
            description,
            imageUrl: req.file.path,
            location,
            UserId: userId || 1,
            category,
            urgency_score,
        });
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report.' });
    }
});

// GET all reports (with search)
router.get('/', async (req, res) => {
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

// GET a single report by ID
router.get('/:id', async (req, res) => {
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

// UPDATE a report's status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found.' });
        }
        report.status = status;
        await report.save();
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update report.' });
    }
});

module.exports = router;