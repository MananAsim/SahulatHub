const express = require('express');
const { getWorkerStats } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// @route   GET /api/workers/me/stats
// @desc    Get stats for the currently authenticated worker
// @access  Private (worker only)
router.get('/me/stats', protect, authorizeRoles('worker'), getWorkerStats);

module.exports = router;
