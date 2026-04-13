const express = require('express');
const CandidateAssessment = require('../models/CandidateAssessment');
const { authenticate, candidateOnly } = require('../middleware/auth');
const router = express.Router();

router.post('/:id/start', authenticate, candidateOnly, async (req, res) => {
    try {
        const { job_id } = req.body;
        let ca = await CandidateAssessment.findOne({ assessment_id: req.params.id, candidate_id: req.user.id });
        if (!ca) {
            ca = new CandidateAssessment({
                candidate_id: req.user.id,
                assessment_id: req.params.id,
                job_id,
                status: 'IN_PROGRESS'
            });
            await ca.save();
        }
        res.json(ca);
    } catch (err) {
        res.status(500).json({ error: 'Failed to start assessment' });
    }
});

module.exports = router;
