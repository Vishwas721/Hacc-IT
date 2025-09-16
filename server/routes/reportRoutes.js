const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Op, sequelize } = require('sequelize');
const { Report, User, Department } = require('../models');
const { protect, anyAdmin, municipalAdminOnly, deptAdminOnly } = require('../middleware/authMiddleware'); // Assuming you updated your middleware

const router = express.Router();

// --- Cloudinary & Multer Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

//
// DELETED: Removed the redundant import statement that was here, causing the server to crash.
//

// POST /api/reports - Create a new report
router.post('/', [protect, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image file is required.' });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, { folder: "civic-reports" });
        
        const { description, longitude, latitude } = req.body;
        const loggedInUserId = req.user.id;
        
        let category = 'Other';
        let urgency_score = 1;
        let departmentId = null;

        if (process.env.GEMINI_API_KEY) {
            try {
                const departments = await Department.findAll({ attributes: ['id', 'name'] });
                const departmentNames = departments.map(d => d.name).join("', '");

                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `
                    Analyze the following citizen report: "${description}".
                    Return a single, clean JSON object with three keys:
                    1. "category": Choose one from 'Pothole', 'Streetlight', 'Garbage', 'Other'.
                    2. "urgency_score": A number from 1 (low) to 5 (high).
                    3. "department": Assign this report to the most relevant department. Choose exactly one from the following list: ['${departmentNames}'].
                `;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);

                category = aiResponse.category || 'Other';
                urgency_score = aiResponse.urgency_score || 1;

                if (aiResponse.department) {
                    const assignedDept = departments.find(d => d.name === aiResponse.department);
                    if (assignedDept) {
                        departmentId = assignedDept.id;
                    }
                }

                const T_HOURS_AGO = new Date(new Date() - (24 * 60 * 60 * 1000));
                const similarReport = await Report.findOne({
                    where: {
                        category: category,
                        status: { [Op.ne]: 'Resolved' },
                        createdAt: { [Op.gte]: T_HOURS_AGO },
                        [Op.and]: sequelize.where(
                            sequelize.fn('ST_DWithin', sequelize.col('location'), sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', longitude, latitude), 4326), 50),
                            true
                        )
                    }
                });

                if (similarReport) {
                    similarReport.upvote_count += 1;
                    await similarReport.save();
                    req.io.emit('report-updated', similarReport.toJSON());
                    return res.status(200).json({
                        message: 'This issue appears to be a duplicate. We have upvoted the original report.',
                        merged: true,
                        report: similarReport
                    });
                }
            } catch (aiError) {
                console.error("AI analysis/assignment failed:", aiError.message);
            }
        }

        const initialHistory = [{ status: 'Submitted', timestamp: new Date(), notes: 'Report received and auto-processed by AI.' }];
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
            DepartmentId: departmentId,
        });
        
        req.io.emit('report-updated', newReport.toJSON());
        res.status(201).json(newReport);

    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report.' });
    }
});


// PUT /api/reports/:id - Update a report's status or department
router.put('/:id', [protect, upload.single('resolvedImage')], async (req, res) => {
    try {
        const { status, resolvedNotes, departmentId } = req.body;
        const report = await Report.findByPk(req.params.id, { include: User });

        if (!report) return res.status(404).json({ error: 'Report not found.' });

        let historyModified = false;

        if (departmentId && report.DepartmentId !== parseInt(departmentId)) {
            const dept = await Department.findByPk(departmentId);
            if(dept) {
                report.DepartmentId = departmentId;
                const newHistoryEntry = { 
                    status: report.status,
                    timestamp: new Date(), 
                    notes: `Report assigned to ${dept.name} department by admin.` 
                };
                report.statusHistory = [...report.statusHistory, newHistoryEntry];
                historyModified = true;
            }
        }
        
        if (status && report.status !== status) {
            report.status = status;
            let notes = `Status updated to "${status}".`;
            
            if (status === 'Resolved' && req.file) {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, { folder: "civic-reports-resolved" });
                report.resolvedImageUrl = cloudinaryResponse.secure_url;
                report.resolvedNotes = resolvedNotes;
                notes = resolvedNotes || 'Issue marked as resolved.';
            }

            const newHistoryEntry = { status, timestamp: new Date(), notes: notes };
            
            if(historyModified) {
                report.statusHistory.pop();
            }
            report.statusHistory = [...report.statusHistory, newHistoryEntry];
        }

        await report.save();
        
        req.io.emit('report-updated', report.toJSON());
        res.status(200).json(report);

    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: 'Failed to update report.' });
    }
});


// GET /api/reports - Get all reports (ROLE-AWARE)
router.get('/', [protect, anyAdmin], async (req, res) => {
    try {
        let whereClause = {};

        if (req.user.role === 'dept-admin') {
            if (!req.user.DepartmentId) {
                return res.json([]); 
            }
            whereClause.DepartmentId = req.user.DepartmentId;
        }

        const reports = await Report.findAll({
            where: whereClause,
            include: [{model: User, attributes: ['username']}, Department],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(reports);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
});

// GET /api/reports/stats - Get report statistics
// In server/routes/reportRoutes.js

// GET /api/reports/stats - Get report statistics (now role-aware)
router.get('/stats', [protect, anyAdmin], async (req, res) => { 
    try {
        // Start with an empty where clause
        let whereClause = {};

        // If the user is a dept-admin, scope the query to their department
        if (req.user.role === 'dept-admin' && req.user.DepartmentId) {
            whereClause.DepartmentId = req.user.DepartmentId;
        }

        const total = await Report.count({ where: whereClause });
        const pending = await Report.count({ where: { ...whereClause, status: 'Submitted' } });
        const resolved = await Report.count({ where: { ...whereClause, status: 'Resolved' } });
        const inProgress = await Report.count({ where: { ...whereClause, status: 'In Progress' } });
        
        res.json({ total, pending, resolved, inProgress });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch report stats.' });
    }
});

// GET /api/reports/by-category - Get reports grouped by category (now role-aware)
router.get('/by-category', [protect, anyAdmin], async (req, res) => {
    try {
        // Start with an empty where clause
        let whereClause = {};

        // If the user is a dept-admin, scope the query to their department
        if (req.user.role === 'dept-admin' && req.user.DepartmentId) {
            whereClause.DepartmentId = req.user.DepartmentId;
        }

        const categoryData = await Report.findAll({
            where: whereClause, // Apply the filter here
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['category'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });
        res.json(categoryData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category data.' });
    }
});

// GET /api/reports/my-reports - Get reports for the currently logged-in citizen
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

// GET /api/reports/:id - Get a single report by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['username'] },
                { model: Department, attributes: ['name'] }
            ]
        });
        if (!report) {
            return res.status(404).json({ error: 'Report not found.' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch report.' });
    }
});

module.exports = router;