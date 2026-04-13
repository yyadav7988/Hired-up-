const express = require('express');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const AptitudeResult = require('../models/AptitudeResult');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/aptitude/topics
 * Returns unique categories + topics from the DB
 */
router.get('/topics', async (req, res) => {
    try {
        const result = await AptitudeQuestion.aggregate([
            { $group: { _id: { category: '$category', topic: '$topic' }, count: { $sum: 1 } } },
            { $group: { _id: '$_id.category', topics: { $push: { name: '$_id.topic', questionCount: '$count' } } } },
            { $sort: { _id: 1 } }
        ]);
        const categories = (result || []).map(cat => ({
            category: cat._id,
            topics: (cat.topics || []).sort((a, b) => a.name.localeCompare(b.name))
        }));
        res.json(categories);
    } catch (err) {
        console.error('Aptitude topics error:', err);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

/**
 * GET /api/aptitude
 * Returns aptitude questions, optionally filtered by topic/category
 */
router.get('/', async (req, res) => {
    try {
        const { topic, category, limit = 20 } = req.query;
        const query = {};
        if (topic) query.topic = topic;
        if (category) query.category = category;

        const questions = await AptitudeQuestion.find(query).limit(Number(limit));
        res.json(questions);
    } catch (err) {
        console.error('Aptitude fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch aptitude questions' });
    }
});

/**
 * POST /api/aptitude/submit
 * Accepts { userId, topic, category, answers: { questionId: selectedAnswerIndex }, totalQuestions }
 * Scores responses against DB correctAnswer, saves AptitudeResult
 */
router.post('/submit', optionalAuth, async (req, res) => {
    try {
        const { userId, topic, category, answers = {}, totalQuestions } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'topic is required' });
        }

        // Fetch the questions so we can grade
        const questionIds = Object.keys(answers);
        let correctAnswers = 0;
        let wrongAnswers = 0;

        if (questionIds.length > 0) {
            const questions = await AptitudeQuestion.find({ _id: { $in: questionIds } });
            const questionMap = {};
            (questions || []).forEach(q => { questionMap[String(q._id)] = q; });

            questionIds.forEach(qId => {
                const q = questionMap[qId];
                if (q) {
                    if (Number(answers[qId]) === Number(q.correctAnswer)) {
                        correctAnswers++;
                    } else {
                        wrongAnswers++;
                    }
                }
            });
        }

        const total = totalQuestions || questionIds.length || 1;
        const score = Math.round((correctAnswers / total) * 100);

        // Save result if userId provided
        const effectiveUserId = (req.user && req.user.id) || userId;
        if (effectiveUserId && effectiveUserId !== 'undefined' && String(effectiveUserId).length > 5) {
            try {
                const newResult = new AptitudeResult({
                    userId: effectiveUserId,
                    topic,
                    category: category || 'General',
                    score,
                    totalQuestions: total,
                    correctAnswers,
                    wrongAnswers
                });
                await newResult.save();
            } catch (saveErr) {
                console.error('Could not save aptitude result:', saveErr.message);
            }
        }

        res.json({
            score,
            totalQuestions: total,
            correctAnswers,
            wrongAnswers,
            feedback: score >= 70 ? 'Great work! You passed.' : 'Keep practicing — you can do it!'
        });
    } catch (err) {
        console.error('Aptitude submit error:', err);
        res.status(500).json({ error: 'Failed to submit aptitude test' });
    }
});

/**
 * GET /api/aptitude/results
 * Returns all aptitude results (recruiter view)
 */
router.get('/results', async (req, res) => {
    try {
        const results = await AptitudeResult.find().sort({ completedAt: -1 }).limit(100);
        res.json(results);
    } catch (err) {
        console.error('Aptitude results error:', err);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

/**
 * GET /api/aptitude/results/:userId
 */
router.get('/results/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const results = await AptitudeResult.find({ userId }).sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('Aptitude user results error:', err);
        res.status(500).json({ error: 'Failed to fetch user results' });
    }
});

module.exports = router;
