const User = require('../models/User');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get stats for the logged-in worker (via JWT or DEV_MODE header)
// @route   GET /api/workers/me/stats
// @access  Private (worker only)
const getWorkerStats = async (req, res) => {
    try {
        const workerId = new mongoose.Types.ObjectId(req.user.id);

        // ── Aggregation: count completed tasks + sum any future budget field ──
        const taskStats = await Task.aggregate([
            {
                $match: {
                    assigned_worker_id: workerId,
                    status: 'completed',
                },
            },
            {
                $group: {
                    _id: null,
                    jobsCompleted: { $sum: 1 },
                    // 'budget' field doesn't exist yet on Task model — defaults to 0
                    totalEarnings: { $sum: { $ifNull: ['$budget', 0] } },
                },
            },
        ]);

        // ── Fetch worker rating from User document ────────────────────────────
        const worker = await User.findById(workerId).select('name rating skills availability location');

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        const stats = taskStats[0] || { jobsCompleted: 0, totalEarnings: 0 };

        res.status(200).json({
            success: true,
            data: {
                name: worker.name,
                rating: worker.rating,
                skills: worker.skills,
                availability: worker.availability,
                location: worker.location,
                jobsCompleted: stats.jobsCompleted,
                averageRating: worker.rating,   // stored on User
                totalEarnings: stats.totalEarnings, // 0 until Task.budget is added
            },
        });
    } catch (error) {
        console.error('Get Worker Stats Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Toggle the logged-in worker's availability
// @route   PATCH /api/workers/me/availability
// @access  Private (worker only)
const toggleAvailability = async (req, res) => {
    try {
        const worker = await User.findById(req.user.id);
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }
        // Allow explicit set via body, or just toggle
        const newStatus =
            req.body.availability !== undefined ? Boolean(req.body.availability) : !worker.availability;
        worker.availability = newStatus;
        await worker.save();
        res.status(200).json({
            success: true,
            message: `Availability set to ${newStatus ? 'online' : 'offline'}`,
            data: { availability: newStatus },
        });
    } catch (error) {
        console.error('Toggle Availability Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get a public worker profile by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerProfile = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id).select(
            'name rating skills availability location createdAt'
        );
        if (!worker || worker.role === undefined) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }
        res.status(200).json({ success: true, data: worker });
    } catch (error) {
        console.error('Get Worker Profile Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { getWorkerStats, toggleAvailability, getWorkerProfile };
