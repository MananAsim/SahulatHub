require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');   // loads + configures strategies
const connectDB = require('./config/db');

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── CORS — must be before routes and before helmet ───────────────────────────
const corsOptions = {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-role', 'x-dev-user-id'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));       // Limit body size
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// ─── Session (needed by Passport OAuth handshake only) ────────────────────────
// Sessions are very short-lived — JWT takes over after the OAuth redirect.
app.use(session({
    secret: process.env.SESSION_SECRET || 'sahulathub_session_secret_dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 5 * 60 * 1000,   // 5 minutes — just long enough for OAuth round-trip
    },
}));

// ─── Passport Initialization ──────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Auth routes: max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again after 15 minutes.' },
    skip: () => process.env.DEV_MODE === 'true',  // Skip in dev mode
});

// Match/AI routes: max 60 requests per minute per IP
const matchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many match requests, slow down.' },
    skip: () => process.env.DEV_MODE === 'true',
});

// ─── Startup Warning ──────────────────────────────────────────────────────────
if (process.env.DEV_MODE === 'true') {
    console.log('');
    console.log('⚠️  ─────────────────────────────────────────────────────────');
    console.log('⚠️   DEV_MODE is ENABLED — JWT auth is BYPASSED');
    console.log('⚠️   Use x-dev-role header to simulate roles (client/worker/admin)');
    console.log('⚠️   Use x-dev-user-id header to simulate a specific user ID');
    console.log('⚠️   Rate limiting is DISABLED in dev mode');
    console.log('⚠️   DO NOT use this mode in production!');
    console.log('⚠️  ─────────────────────────────────────────────────────────');
    console.log('');
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/oauthRoutes'));   // Google & Facebook OAuth
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/match', matchLimiter, require('./routes/matchRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

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
        version: '1.1.0',
        status: 'running',
        dev_mode: process.env.DEV_MODE === 'true',
        ai_service: process.env.AI_SERVICE_URL || 'http://localhost:8001',
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
