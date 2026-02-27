const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * - Always checks for a Bearer JWT token first
 * - In DEV_MODE=true with NO token: uses a mock user (x-dev-role / x-dev-user-id headers)
 * - Otherwise: validates the JWT and loads the real user from DB
 */
const protect = async (req, res, next) => {
    // ─── Check for Bearer token first (works in both DEV and PROD) ────────────
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // ─── DEV MODE BYPASS (only when NO token is provided) ─────────────────────
    if (process.env.DEV_MODE === 'true' && !token) {
        // Use x-dev-role header to simulate different roles, defaults to 'client'
        const devRole = req.headers['x-dev-role'] || 'client';
        const devUserId = req.headers['x-dev-user-id'] || '000000000000000000000001';

        req.user = {
            id: devUserId,
            role: devRole,
            name: 'DEV_USER',
            email: 'dev@sahulathub.com',
        };

        console.log(`⚠️  [DEV_MODE] Auth bypassed — role: ${devRole}`);
        return next();
    }

    // ─── JWT AUTH (used in both DEV and PROD when token is present) ─────────────
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }
};

module.exports = { protect };
