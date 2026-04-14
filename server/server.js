// NOTE: dotenv MUST be loaded before any other require that uses env vars
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
    origin: "https://hired-up-mauve.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database ───────────────────────────────────────────────────────────────
connectDB();

// ── Routes ─────────────────────────────────────────────────────────────────
const authRouter         = require('./routes/auth');
const jobsRouter         = require('./routes/jobs');
const problemsRouter     = require('./routes/problems');
const aptitudeRouter     = require('./routes/aptitude');
const executeRouter      = require('./routes/execute');
const submissionsRouter  = require('./routes/submissions');
const certificatesRouter = require('./routes/certificates');
const assessmentsRouter  = require('./routes/assessments');
const takeRouter         = require('./routes/take');
const scoringRouter      = require('./routes/scoring');
const performanceRouter  = require('./routes/performance');

app.use('/api/auth',         authRouter);
app.use('/api/jobs',         jobsRouter);
app.use('/api/problems',     problemsRouter);
app.use('/api/aptitude',     aptitudeRouter);
app.use('/api/execute',      executeRouter);
app.use('/api/submissions',  submissionsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/assessments',  assessmentsRouter);
app.use('/api/take',         takeRouter);
app.use('/api/scoring',      scoringRouter);
app.use('/api/performance',  performanceRouter);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 HiredUp API running on http://localhost:${PORT}`);
    console.log(`   NODE_ENV : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB  : ${process.env.MONGO_URI ? 'configured' : '⚠️  MONGO_URI not set!'}`);
    console.log('\n📡 Mounted Routes:');
    const routes = [
        'GET  /api/health',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET  /api/auth/me',
        'GET  /api/auth/candidates',
        'GET  /api/jobs',
        'POST /api/jobs',
        'GET  /api/problems',
        'GET  /api/problems/:id',
        'GET  /api/aptitude',
        'GET  /api/aptitude/topics',
        'POST /api/aptitude/submit',
        'GET  /api/aptitude/results/:userId',
        'POST /api/execute/run',
        'POST /api/execute',
        'GET  /api/submissions',
        'POST /api/submissions',
        'GET  /api/certificates',
        'POST /api/certificates/verify',
        'GET  /api/assessments',
        'POST /api/assessments',
        'GET  /api/scoring/:candidateId/:jobId',
        'GET  /api/performance',
    ];
    routes.forEach(r => console.log(`   ${r}`));
    console.log('');
});

// ── Port Conflict Handler ───────────────────────────────────────────────────
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Stop the existing process or set a different PORT in .env`);
        console.error(`   Example: PORT=5001 node server.js\n`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
