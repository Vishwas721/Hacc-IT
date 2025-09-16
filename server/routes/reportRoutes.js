const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- START: CORRECTED IMPORTS ---
const { Op } = require('sequelize'); // Get Op from the library
const { sequelize, Report, User, Department } = require('../models'); // Get the INSTANCE and models
const { protect, anyAdmin, municipalAdminOnly, deptAdminOnly } = require('../middleware/authMiddleware');
// --- END: CORRECTED IMPORTS ---

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
// In server/routes/reportRoutes.js

router.post('/', [protect, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image file is required.' });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, { folder: "civic-reports" });
        
        const loggedInUserId = req.user.id;
        const originalDescription = req.body.description;
        let englishDescription = originalDescription;

        // --- 1. DECLARE all variables at the top level ---
        let category = 'Other';
        let urgency_score = 1;
        let departmentId = null;
        let priority = 'Medium'; // <-- Moved declaration here

        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                // Step 1: Translate
                const translationPrompt = `Translate the following text to English: "${originalDescription}"`;
                const translationResult = await model.generateContent(translationPrompt);
                englishDescription = translationResult.response.text().trim();
                console.log(`Translated "${originalDescription}" to "${englishDescription}"`);

                // Step 2: Analyze
                const departments = await Department.findAll({ attributes: ['id', 'name'] });
                const departmentNames = departments.map(d => d.name).join("', '");
                const analysisPrompt = `
                    Analyze the following citizen report: "${englishDescription}".
                    Return a single, clean JSON object with four keys:
                    1. "category": Choose one from 'Pothole', 'Streetlight', 'Garbage', 'Other'.
                    2. "urgency_score": A number from 1 (low) to 5 (high).
                    3. "department": Assign this report to the most relevant department. Choose from: ['${departmentNames}'].
                    4. "priority": Choose one from 'High', 'Medium', 'Low'.
                `;
                const analysisResult = await model.generateContent(analysisPrompt);
                const responseText = analysisResult.response.text();
                const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);

                // --- 2. ASSIGN values here (do not re-declare with 'const') ---
                category = aiResponse.category || 'Other';
                urgency_score = aiResponse.urgency_score || 1;
                priority = aiResponse.priority || 'Medium'; // <-- Assign value, don't re-declare

                // Department matching logic
                if (aiResponse.department) {
                    const aiDeptName = aiResponse.department.toLowerCase().trim();
                    const assignedDept = departments.find(d => 
                        aiDeptName.includes(d.name.toLowerCase()) || 
                        d.name.toLowerCase().includes(aiDeptName)
                    );
                    if (assignedDept) {
                        departmentId = assignedDept.id;
                    }
                }

                // Duplicate check logic
                const T_HOURS_AGO = new Date(new Date() - (24 * 60 * 60 * 1000));
                const similarReport = await Report.findOne({ /* ... your duplicate check where clause ... */ });

                if (similarReport) {
                    // ... your duplicate handling logic ...
                }

            } catch (aiError) {
                console.error("AI Translation/Analysis failed:", aiError.message);
            }
        }
        
        const initialHistory = [{ status: 'Submitted', timestamp: new Date(), notes: 'Report received and auto-processed by AI.' }];
        const location = { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] };

        const newReport = await Report.create({
            description: englishDescription,
            originalDescription: originalDescription,
            imageUrl: cloudinaryResponse.secure_url,
            location, // <-- 3. FIX: Removed duplicate 'location' key
            UserId: loggedInUserId,
            category,
            urgency_score,
            status: 'Submitted',
            priority: priority, // This will now work correctly
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
// In server/routes/reportRoutes.js

// NEW ROUTE 1: For Municipal Admin to assign/re-assign a department (Corrected Version)
router.put('/:id/assign', [protect, municipalAdminOnly], async (req, res) => {
    try {
        const { departmentId } = req.body;
        console.log(`Assigning report ${req.params.id} to department ${departmentId}`); // For debugging

        const report = await Report.findByPk(req.params.id);
        if (!report) return res.status(404).json({ error: 'Report not found.' });

        const dept = await Department.findByPk(departmentId);
        if (!dept) return res.status(404).json({ error: 'Department not found.' });
        
        // --- THIS IS THE ROBUST FIX ---
        report.DepartmentId = departmentId;
        report.status = 'Assigned'; // 1. Explicitly set the main status

        // 2. Safely handle the statusHistory array
        const currentHistory = report.statusHistory || []; // Ensure it's an array, even if it's null
        const newHistoryEntry = {
            status: 'Assigned',
            timestamp: new Date(),
            notes: `Report assigned to ${dept.name} department.`
        };

        // 3. Create a new array to ensure Sequelize detects the change
        report.statusHistory = [...currentHistory, newHistoryEntry];
        
        await report.save();
        
        console.log('Report saved successfully with new status:', report.status); // For debugging
        req.io.emit('report-updated', report.toJSON());
        res.status(200).json(report);

    } catch (error) {
        console.error("Error assigning department:", error);
        res.status(500).json({ error: 'Failed to assign department.' });
    }
});
// NEW ROUTE 2: For Department Admin to update a report's status
router.put('/:id/status', [protect, deptAdminOnly, upload.single('resolvedImage')], async (req, res) => {
    try {
        const { status, resolvedNotes } = req.body;
        const report = await Report.findByPk(req.params.id);

        if (!report) return res.status(404).json({ error: 'Report not found.' });

        // --- START: NEW GAMIFICATION LOGIC ---
        if (status === 'Resolved' && report.status !== 'Resolved') {
            let pointsToAward = 50; // Base points for resolution

            // Check for SLA bonus
            if (report.slaDeadline && new Date() < new Date(report.slaDeadline)) {
                pointsToAward += 25; // Add bonus points
                console.log(`SLA BONUS: Awarding +25 extra points to Dept ID ${report.DepartmentId}`);
            }
            
            // Award the points to the department
            if (report.DepartmentId) {
                await Department.increment('points', {
                    by: pointsToAward,
                    where: { id: report.DepartmentId }
                });
            }
        }
        // --- END: NEW GAMIFICATION LOGIC ---

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
        report.statusHistory = [...report.statusHistory, newHistoryEntry];

        await report.save();
        
        req.io.emit('report-updated', report.toJSON());
        res.status(200).json(report);

    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

// In server/routes/reportRoutes.js, after your other PUT routes

// NEW ROUTE 3: For Municipal Admin to set an SLA deadline
router.put('/:id/sla', [protect, municipalAdminOnly], async (req, res) => {
    try {
        const { deadline } = req.body; // Expecting a full ISO date string
        const report = await Report.findByPk(req.params.id);

        if (!report) return res.status(404).json({ error: 'Report not found.' });

        report.slaDeadline = deadline;

        // Add a history entry for the SLA
        const newHistoryEntry = {
            status: report.status,
            timestamp: new Date(),
            notes: `SLA deadline set to ${new Date(deadline).toLocaleString()}.`
        };
        report.statusHistory = [...(report.statusHistory || []), newHistoryEntry];
        
        await report.save();
        
        req.io.emit('report-updated', report.toJSON());
        res.status(200).json(report);

    } catch (error) {
        console.error("Error setting SLA:", error);
        res.status(500).json({ error: 'Failed to set SLA.' });
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

// In server/routes/reportRoutes.js

// GET /api/reports/by-category - Get reports grouped by category (using a raw query)
// In server/routes/reportRoutes.js

// GET /api/reports/by-category - (Definitive Version with Debugging)
router.get('/by-category', [protect, anyAdmin], async (req, res) => {
    try {
        let whereClause = 'WHERE "category" IS NOT NULL';
        let replacements = {};

        if (req.user.role === 'dept-admin' && req.user.DepartmentId) {
            whereClause += ' AND "DepartmentId" = :departmentId';
            replacements.departmentId = req.user.DepartmentId;
        }

        const query = `
            SELECT "category", COUNT("id")::int as "count"
            FROM "Reports"
            ${whereClause}
            GROUP BY "category"
            ORDER BY "count" DESC;
        `;

        // This line will now work because 'sequelize' is correctly defined
        const categoryData = await sequelize.query(query, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        
        res.json(categoryData);

    } catch (error) {
        console.error("Error fetching category data:", error);
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