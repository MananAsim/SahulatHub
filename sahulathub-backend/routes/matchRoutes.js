const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { findMatches } = require('../services/matchService');

const router = express.Router();

// @desc    Matchmaking endpoint — returns ranked providers
// @route   POST /api/match
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { query, location, radius, urgency } = req.body;

        if (!query || !location) {
            return res.status(400).json({
                success: false,
                message: 'query and location (lat, lng) are required',
            });
        }

        if (!location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: 'location must include lat and lng',
            });
        }

        const results = await findMatches({
            query,
            location,
            radius: radius || 10,
            urgency: urgency || 'medium',
        });

        res.status(200).json({
            success: true,
            query,
            location,
            radius: radius || 10,
            urgency: urgency || 'medium',
            total_providers: results.length,
            data: results,
        });
    } catch (error) {
        console.error('Match Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
