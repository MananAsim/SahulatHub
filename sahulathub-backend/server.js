require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── CORS — must be before routes and before helmet ───────────────────────────
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-role', 'x-dev-user-id'],
};
app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── Startup Warning ──────────────────────────────────────────────────────────
if (process.env.DEV_MODE === 'true') {
    console.log('');
    console.log('⚠️  ─────────────────────────────────────────────────────────');
    console.log('⚠️   DEV_MODE is ENABLED — JWT auth is BYPASSED');
    console.log('⚠️   Use x-dev-role header to simulate roles (client/worker/admin)');
    console.log('⚠️   Use x-dev-user-id header to simulate a specific user ID');
    console.log('⚠️   DO NOT use this mode in production!');
    console.log('⚠️  ─────────────────────────────────────────────────────────');
    console.log('');
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));

// DEV routes — only available when DEV_MODE=true
if (process.env.DEV_MODE === 'true') {
    app.use('/api/dev', require('./routes/devRoutes'));
    console.log('🛠️   Dev routes mounted at /api/dev');
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        project: 'SahulatHub',
        version: '1.0.0',
        status: 'running',
        dev_mode: process.env.DEV_MODE === 'true',
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SahulatHub server running on http://localhost:${PORT}`);
});

module.exports = app;
