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

module.exports = { getWorkerStats };
