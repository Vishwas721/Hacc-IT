const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { Report, User } = require('../db'); // We'll create this db file next

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic-reports', // A folder name in your Cloudinary account
        format: async (req, file) => 'png', // supports promises as well
        public_id: (req, file) => new Date().toISOString() + '-' + file.originalname,
    },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// POST a new report
// The 'upload.single('image')' part is the middleware that handles the file upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { description, longitude, latitude, userId } = req.body;

        // 1. Validate input
        if (!description || !longitude || !latitude || !req.file) {
            return res.status(400).json({ error: 'Missing required fields or image.' });
        }

        // 2. Format location for PostGIS
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude], // Note: longitude first
        };

        // 3. Create the report in the database
        const newReport = await Report.create({
            description: description,
            imageUrl: req.file.path, // URL from Cloudinary
            location: location,
            UserId: userId || null, // Associate with a user if userId is provided
        });

        // 4. Send success response
        res.status(201).json(newReport);

    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report.' });
    }
});

// GET all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.findAll({
            order: [['createdAt', 'DESC']], // Show newest reports first
        });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
});


module.exports = router;