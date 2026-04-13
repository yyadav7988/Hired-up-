const express = require('express');
const { CredibilityScore } = require('../models/Misc');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/:candidateId/:jobId', async (req, res) => {
    try {
        const { candidateId, jobId } = req.params;
        const score = await CredibilityScore.findOne({ candidateId, jobId });
        res.json(score || { totalScore: 0, breakdown: {} });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch score' });
    }
});

module.exports = router;
