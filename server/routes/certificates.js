const express = require('express');
const Certificate = require('../models/Certificate');
const { verifyCertificateOCR } = require('../services/aiService');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
    try {
        if (!req.user) return res.json([]);
        const certs = await Certificate.find({ candidate_id: req.user.id });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

router.post('/verify', optionalAuth, async (req, res) => {
    try {
        const { file_path } = req.body;
        const verification = await verifyCertificateOCR(file_path);
        
        if (req.user) {
            const cert = new Certificate({
                candidate_id: req.user.id,
                file_path,
                platform: verification.platform,
                trust_score: verification.trustScore,
                status: verification.status
            });
            await cert.save();
        }

        res.json(verification);
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify certificate' });
    }
});

module.exports = router;
