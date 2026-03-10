const express = require('express');
const { getWorkerStats, toggleAvailability, getWorkerProfile } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// @route   GET  /api/workers/me/stats      — worker's own stats summary
router.get('/me/stats', protect, authorizeRoles('worker'), getWorkerStats);

// @route   PATCH /api/workers/me/availability — toggle worker online/offline
router.patch('/me/availability', protect, authorizeRoles('worker'), toggleAvailability);

// @route   GET  /api/workers/:id            — public worker profile (any user)
router.get('/:id', getWorkerProfile);

module.exports = router;
