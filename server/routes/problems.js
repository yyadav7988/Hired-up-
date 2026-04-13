const express = require('express');
const Problem = require('../models/Problem');
const router = express.Router();

/**
 * GET /api/problems
 * Returns all problems (public) — hides hidden test cases
 */
router.get('/', async (req, res) => {
    try {
        const { difficulty, tag } = req.query;
        const query = {};
        if (difficulty) query.difficulty = difficulty;
        if (tag) query.tags = tag;

        const problems = await Problem.find(query);
        // Return all fields but strip hidden test cases
        const sanitized = (problems || []).map(p => ({
            _id: p._id,
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            tags: p.tags || [],
            exampleInput: p.exampleInput || '',
            exampleOutput: p.exampleOutput || '',
            constraints: p.constraints || [],
            // Only show non-hidden test cases for practice
            testCases: (p.testCases || []).filter(tc => !tc.hidden).map(tc => ({
                input: tc.input,
                output: tc.output
            }))
        }));
        res.json(sanitized);
    } catch (err) {
        console.error('Problems fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

/**
 * GET /api/problems/:id
 * Returns a single problem by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json({
            _id: problem._id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            tags: problem.tags || [],
            exampleInput: problem.exampleInput || '',
            exampleOutput: problem.exampleOutput || '',
            constraints: problem.constraints || [],
            testCases: (problem.testCases || []).map(tc => ({
                input: tc.input,
                output: tc.output,
                hidden: tc.hidden || false
            }))
        });
    } catch (err) {
        console.error('Problem by ID error:', err);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

/**
 * POST /api/problems
 * Create a new problem (admin use / seeding)
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, difficulty, tags, exampleInput, exampleOutput, constraints, testCases } = req.body;
        if (!title || !description || !difficulty) {
            return res.status(400).json({ error: 'title, description, and difficulty are required' });
        }
        const problem = new Problem({ title, description, difficulty, tags: tags || [], exampleInput, exampleOutput, constraints, testCases });
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        console.error('Problem create error:', err);
        res.status(500).json({ error: 'Failed to create problem' });
    }
});

module.exports = router;
