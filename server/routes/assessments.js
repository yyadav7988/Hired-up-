const express = require('express');
const Assessment = require('../models/Assessment');
const { authenticate, recruiterOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const assessments = await Assessment.find();
        res.json(assessments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

router.post('/', authenticate, recruiterOnly, async (req, res) => {
    try {
        const { job_id, name, type, questions } = req.body;
        const newAsmt = new Assessment({ job_id, name, type, questions });
        await newAsmt.save();
        res.json(newAsmt);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create assessment' });
    }
});

module.exports = router;
