const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { findMatches } = require('../services/matchService');

const router = express.Router();

// @desc    Matchmaking endpoint — returns AI-ranked providers
// @route   POST /api/match
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { query, location, radius, urgency, top_n } = req.body;

        if (!query || !location) {
            return res.status(400).json({
                success: false,
                message: 'query and location (lat, lng) are required',
            });
        }

        if (location.lat === undefined || location.lng === undefined) {
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
            top_n: top_n || 10,
        });

        res.status(200).json({
            success: true,
            query,
            location,
            radius: radius || 10,
            urgency: urgency || 'medium',
            total_providers: results.length,
            ai_powered: results.length > 0 ? results[0].ai_scored : false,
            data: results,
        });
    } catch (error) {
        console.error('Match Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
