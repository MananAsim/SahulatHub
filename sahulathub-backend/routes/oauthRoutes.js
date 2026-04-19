const express = require('express');
const passport = require('passport');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Helper: build the post-OAuth frontend redirect URL ───────────────────────
/**
 * After a successful OAuth callback, we redirect the user's browser to the
 * Next.js /auth/callback page with the JWT and role in the query string.
 * The frontend page then persists the session and sends the user to their dashboard.
 */
const buildSuccessRedirect = (user) => {
    const params = new URLSearchParams({
        token: user.oauthToken,
        role: user.role,
    });
    return `${FRONTEND_URL}/auth/callback?${params.toString()}`;
};

const buildErrorRedirect = (message) => {
    const params = new URLSearchParams({ error: message });
    return `${FRONTEND_URL}/auth/login?${params.toString()}`;
};

// ─── Google OAuth ──────────────────────────────────────────────────────────────

// Step 1: Redirect user to Google
// The `role` query param is passed through OAuth `state` so the callback can access it
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'client';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: role,         // passed back to callback as req.query.state
        session: false,      // we use JWT, not sessions
    })(req, res, next);
});

// Step 2: Google redirects back here with code
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: buildErrorRedirect('google_auth_failed'),
    }),
    (req, res) => {
        if (!req.user || !req.user.oauthToken) {
            return res.redirect(buildErrorRedirect('google_token_missing'));
        }
        res.redirect(buildSuccessRedirect(req.user));
    }
);

// ─── Facebook OAuth ────────────────────────────────────────────────────────────

// Step 1: Redirect user to Facebook
router.get('/facebook', (req, res, next) => {
    const role = req.query.role || 'client';
    passport.authenticate('facebook', {
        scope: ['email'],
        state: role,
        session: false,
    })(req, res, next);
});

// Step 2: Facebook redirects back here with code
router.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: buildErrorRedirect('facebook_auth_failed'),
    }),
    (req, res) => {
        if (!req.user || !req.user.oauthToken) {
            return res.redirect(buildErrorRedirect('facebook_token_missing'));
        }
        res.redirect(buildSuccessRedirect(req.user));
    }
);

module.exports = router;
