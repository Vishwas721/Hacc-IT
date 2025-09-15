// File: server/routes/departmentRoutes.js
const express = require('express');
const { Department } = require('../models');
const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.findAll({ order: [['name', 'ASC']] });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments.' });
    }
});

// POST /api/departments - Create a new department
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newDepartment = await Department.create({ name });
        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create department.' });
    }
});

// PUT /api/departments/:id - Update a department
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const department = await Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found.' });
        
        department.name = name;
        await department.save();
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update department.' });
    }
});

// DELETE /api/departments/:id - Delete a department
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found.' });

        await department.destroy();
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department.' });
    }
});

module.exports = router;