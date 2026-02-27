const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

/**
 * DEV ROUTES — Only mounted when DEV_MODE=true
 * These routes expose test utilities for development and Postman testing.
 */

// ─── Shared seed logic (reused by seed.js AND /api/dev/reset) ─────────────────
async function runSeed() {
    await User.deleteMany({});
    await Task.deleteMany({});

    const SALT = 10;
    const [h1, h2, h3, h4, h5] = await Promise.all([
        bcrypt.hash('password123', SALT),
        bcrypt.hash('password123', SALT),
        bcrypt.hash('password123', SALT),
        bcrypt.hash('password123', SALT),
        bcrypt.hash('admin2024', SALT),
    ]);

    const users = await User.insertMany([
        { name: 'Ahmed Khan', email: 'ahmed@example.com', password: h1, role: 'client', rating: 4.2, location: { lat: 33.6844, lng: 73.0479 }, skills: [], availability: true },
        { name: 'Fatima Malik', email: 'fatima@example.com', password: h2, role: 'client', rating: 3.8, location: { lat: 31.5497, lng: 74.3436 }, skills: [], availability: true },
        { name: 'Bilal Raza', phone: '+923001112222', password: h3, role: 'worker', rating: 4.7, location: { lat: 33.7294, lng: 73.0931 }, skills: ['plumbing', 'repair', 'installation'], availability: true },
        { name: 'Sara Iqbal', phone: '+923003334444', password: h4, role: 'worker', rating: 4.1, location: { lat: 33.6204, lng: 72.9740 }, skills: ['cleaning', 'housekeeping', 'cooking'], availability: true },
        { name: 'Super Admin', email: 'admin@sahulathub.com', password: h5, role: 'admin', rating: 5.0, location: { lat: 33.6844, lng: 73.0479 }, skills: ['management'], availability: true },
    ]);

    const [c1, c2, w1] = users;

    const tasks = await Task.insertMany([
        { title: 'Fix kitchen pipe leak', description: 'Kitchen sink pipe leaking.', category: 'Plumbing', urgency: 'high', location: { lat: 33.6844, lng: 73.0479 }, radius: 10, status: 'open', client_id: c1._id },
        { title: 'House deep cleaning', description: '2-bedroom deep clean.', category: 'Cleaning', urgency: 'medium', location: { lat: 31.5497, lng: 74.3436 }, radius: 5, status: 'open', client_id: c2._id },
        { title: 'AC installation', description: '1.5 ton split AC install.', category: 'Electrical', urgency: 'low', location: { lat: 33.6844, lng: 73.0479 }, radius: 15, status: 'assigned', client_id: c1._id, assigned_worker_id: w1._id },
        { title: 'Deep kitchen cleaning', description: 'Full kitchen deep clean.', category: 'Cleaning', urgency: 'medium', location: { lat: 33.7294, lng: 73.0931 }, radius: 8, status: 'completed', client_id: c2._id, assigned_worker_id: w1._id },
    ]);

    return { users, tasks };
}

// @route   GET /api/dev/status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        mode: 'DEV',
        message: '⚠️  DEV_MODE is active. JWT verification is DISABLED.',
        timestamp: new Date().toISOString(),
    });
});

// @route   GET /api/dev/users
// List all users (excluding password hash)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   GET /api/dev/tasks
// List all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('client_id', 'name email')
            .populate('assigned_worker_id', 'name email');
        res.json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   GET /api/dev/reset
// Wipe DB and re-seed with bcrypt-hashed passwords + test tasks
// Use this to recover from a broken DB state in development.
router.get('/reset', async (req, res) => {
    try {
        const { users, tasks } = await runSeed();
        res.json({
            success: true,
            message: '✅ Database wiped and re-seeded successfully.',
            credentials: [
                { role: 'CLIENT', identifier: 'ahmed@example.com', password: 'password123', loginRoute: 'POST /api/auth/login' },
                { role: 'CLIENT', identifier: 'fatima@example.com', password: 'password123', loginRoute: 'POST /api/auth/login' },
                { role: 'WORKER', identifier: '+923001112222', password: 'password123', loginRoute: 'POST /api/auth/worker-login' },
                { role: 'WORKER', identifier: '+923003334444', password: 'password123', loginRoute: 'POST /api/auth/worker-login' },
                { role: 'ADMIN', identifier: 'admin@sahulathub.com', password: 'admin2024', loginRoute: 'POST /api/auth/login' },
            ],
            usersCreated: users.length,
            tasksCreated: tasks.length,
        });
    } catch (error) {
        console.error('Dev reset error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   DELETE /api/dev/reset
// Wipe only — no re-seed
router.delete('/reset', async (req, res) => {
    try {
        await User.deleteMany({});
        await Task.deleteMany({});
        res.json({ success: true, message: 'All users and tasks deleted. Ready to re-seed.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
