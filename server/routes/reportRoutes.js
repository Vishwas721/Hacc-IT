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
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
// in server/routes/reportRoutes.js

// --- UPDATE THE 'POST' ROUTE ---
// in server/routes/reportRoutes.js

// --- POST a new report (Bulletproof Version) ---
// in server/routes/reportRoutes.js

// --- POST a new report (Final Version) ---
// in server/routes/reportRoutes.js

// --- POST a new report (Final Corrected Version) ---
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { description, longitude, latitude } = req.body;
        if (!description || !longitude || !latitude || !req.file) {
            return res.status(400).json({ error: 'Missing required fields or image.' });
        }

        const adminUser = await User.findOne({ where: { role: 'super-admin' } });
        if (!adminUser) {
            return res.status(500).json({ error: 'Failed to create report.', details: 'No super-admin user found.' });
        }
        
        let category = 'Other';
        let urgency_score = 1;

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
        } else {
            console.log("GEMINI_API_KEY not found, skipping AI analysis.");
        }

        // THIS IS THE FIX: Define initialHistory here
        const initialHistory = [{
            status: 'Submitted',
            timestamp: new Date(),
            notes: 'Report received from citizen.',
        }];
        
        const location = { type: 'Point', coordinates: [longitude, latitude] };
        const newReport = await Report.create({
            description,
            imageUrl: req.file.path,
            location,
            UserId: adminUser.id,
            category,
            urgency_score,
            status: 'Submitted',
            statusHistory: initialHistory, // Now this variable exists
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

// Add these new routes in server/routes/reportRoutes.js
// IMPORTANT: Place this code BEFORE the router.get('/:id', ...) route

// --- GET report statistics ---
// GET /api/reports/stats
// in server/routes/reportRoutes.js

// --- GET report statistics (Improved) ---
// GET /api/reports/stats
router.get('/stats', async (req, res) => {
    try {
        const total = await Report.count();
        
        // Use Op.iLike for case-insensitive matching
        const pending = await Report.count({
            where: {
                status: {
                    [Op.iLike]: 'Pending'
                }
            }
        });

        const resolved = await Report.count({
            where: {
                status: {
                    [Op.iLike]: 'Resolved'
                }
            }
        });
        
        const inProgress = await Report.count({
            where: {
                status: {
                    [Op.iLike]: 'In Progress'
                }
            }
        });


        res.json({ total, pending, resolved, inProgress });
    } catch (error) {
        console.error('Failed to fetch report stats:', error);
        res.status(500).json({ error: 'Failed to fetch report stats.' });
    }
});
// --- GET reports grouped by category for the chart ---
// GET /api/reports/by-category
router.get('/by-category', async (req, res) => {
    try {
        const categoryData = await Report.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['category'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });
        res.json(categoryData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category data.' });
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
        
        // Add a new entry to the history array
        const newHistoryEntry = {
            status: status,
            timestamp: new Date(),
            notes: `Status updated by admin.` // We can add more detail here later
        };
        
        // IMPORTANT: Update the array and the status field
        report.status = status;
        report.statusHistory = [...report.statusHistory, newHistoryEntry];
        
        await report.save();
        res.status(200).json(report);
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: 'Failed to update report.' });
    }
});

module.exports = router;