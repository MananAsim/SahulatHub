const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Passport.js Configuration
 *
 * We use Passport only for the OAuth handshake.
 * All session/persistence is handled via JWT — no server-side sessions are stored.
 * express-session is required only as a transport for Passport's internal state
 * during the OAuth redirect round-trip.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Serialize / Deserialize (minimal — JWT handles real auth) ─────────────────
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ─── Shared OAuth callback handler ────────────────────────────────────────────
/**
 * @param {string} provider - 'google' | 'facebook'
 * @param {object} profile  - Passport OAuth profile
 * @param {string} role     - 'client' | 'worker' (from state param)
 * @param {Function} done
 */
async function handleOAuthCallback(provider, profile, role, done) {
    try {
        const email = profile.emails?.[0]?.value?.toLowerCase().trim();
        const name = profile.displayName || profile.name?.givenName || 'User';
        const photo = profile.photos?.[0]?.value;

        // Find existing user by email, or create a new one
        let user = email ? await User.findOne({ email }) : null;

        if (!user) {
            // New user — register them
            // OAuth users get a random secure password (they never need it — they log in via OAuth)
            const crypto = require('crypto');
            const randomPassword = crypto.randomBytes(32).toString('hex');

            user = new User({
                name,
                email,
                password: randomPassword,     // will be hashed by pre-save hook
                role: ['client', 'worker'].includes(role) ? role : 'client',
                profilePhoto: photo || undefined,
                location: { lat: 0, lng: 0 },
                skills: [],
                availability: true,
            });

            await user.save();
            console.log(`🆕 [OAuth:${provider}] New user created: ${email}`);
        } else {
            console.log(`✅ [OAuth:${provider}] Existing user found: ${email}`);
        }

        // Generate a JWT for the frontend
        const token = generateToken({ id: user._id, role: user.role });

        // Attach token + role to user object so the route callback can redirect
        user.oauthToken = token;
        return done(null, user);
    } catch (err) {
        console.error(`[OAuth:${provider}] Error:`, err.message);
        return done(err, null);
    }
}

// ─── Google OAuth 2.0 Strategy ────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                const role = req.query.state || 'client';
                await handleOAuthCallback('google', profile, role, done);
            }
        )
    );
    console.log('🔑 Google OAuth strategy loaded.');
} else {
    console.warn('⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.');
}

// ─── Facebook OAuth Strategy ──────────────────────────────────────────────────
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
                profileFields: ['id', 'displayName', 'emails', 'photos'],
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                const role = req.query.state || 'client';
                await handleOAuthCallback('facebook', profile, role, done);
            }
        )
    );
    console.log('🔑 Facebook OAuth strategy loaded.');
} else {
    console.warn('⚠️  FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set — Facebook OAuth disabled.');
}

module.exports = passport;
