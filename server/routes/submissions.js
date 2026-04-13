const express = require('express');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/submissions
 * Save a new code submission. Optionally runs AI analysis.
 */
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { problemId, code, language, status, output, executionTime, aiFeedback } = req.body;

        if (!problemId || !code || !language) {
            return res.status(400).json({ error: 'problemId, code, and language are required' });
        }

        const userId = req.user ? req.user.id : null;

        const sub = new Submission({
            userId,
            problemId,
            code,
            language,
            status: status || 'Pending',
            output: output || '',
            executionTime: executionTime || null,
            aiFeedback: aiFeedback || null
        });

        // Try AI feedback if none was provided
        if (!aiFeedback) {
            try {
                const { analyzeCode } = require('../services/aiService');
                const problem = await Problem.findById(problemId);
                if (problem) {
                    sub.aiFeedback = await analyzeCode(code, problem.description, language);
                }
            } catch (aiErr) {
                console.warn('AI analysis skipped:', aiErr.message);
            }
        }

        await sub.save();
        res.status(201).json(sub);
    } catch (err) {
        console.error('Submission create error:', err);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

/**
 * GET /api/submissions
 * Returns submissions for the authenticated user, or all if no auth (capped).
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const query = {};
        if (req.user) query.userId = req.user.id;
        const subs = await Submission.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(subs);
    } catch (err) {
        console.error('Submission fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/**
 * GET /api/submissions/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const sub = await Submission.findById(req.params.id);
        if (!sub) return res.status(404).json({ error: 'Submission not found' });
        res.json(sub);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

module.exports = router;
