const express = require('express');
const Submission = require('../models/Submission');
const AptitudeResult = require('../models/AptitudeResult');
const CandidateAssessment = require('../models/CandidateAssessment');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/performance
 * Returns performance stats for the current user:
 * - total submissions
 * - accepted submissions
 * - aptitude scores
 * - assessments taken
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        // Defaults for unauthenticated users
        if (!userId) {
            return res.json({
                submissions: { total: 0, accepted: 0, successRate: 0 },
                aptitude: { total: 0, averageScore: 0, results: [] },
                assessments: { total: 0, completed: 0 }
            });
        }

        // Submissions stats
        const [allSubs, acceptedSubs] = await Promise.all([
            Submission.countDocuments({ userId }),
            Submission.countDocuments({ userId, status: 'Accepted' })
        ]);

        // Recent submissions (for chart data)
        const recentSubs = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('status language createdAt executionTime');

        // Aptitude results
        const aptResults = await AptitudeResult.find({ userId }).sort({ completedAt: -1 }).limit(20);
        const avgAptScore = aptResults.length > 0
            ? Math.round(aptResults.reduce((sum, r) => sum + (r.score || 0), 0) / aptResults.length)
            : 0;

        // Assessments
        const [totalAssessments, completedAssessments] = await Promise.all([
            CandidateAssessment.countDocuments({ candidate_id: userId }),
            CandidateAssessment.countDocuments({ candidate_id: userId, status: 'COMPLETED' })
        ]);

        res.json({
            submissions: {
                total: allSubs,
                accepted: acceptedSubs,
                successRate: allSubs > 0 ? Math.round((acceptedSubs / allSubs) * 100) : 0,
                recent: (recentSubs || []).map(s => ({
                    status: s.status,
                    language: s.language,
                    createdAt: s.createdAt,
                    executionTime: s.executionTime
                }))
            },
            aptitude: {
                total: aptResults.length,
                averageScore: avgAptScore,
                results: (aptResults || []).map(r => ({
                    topic: r.topic,
                    category: r.category,
                    score: r.score,
                    totalQuestions: r.totalQuestions,
                    correctAnswers: r.correctAnswers,
                    completedAt: r.completedAt
                }))
            },
            assessments: {
                total: totalAssessments,
                completed: completedAssessments
            }
        });
    } catch (err) {
        console.error('Performance fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});

module.exports = router;
