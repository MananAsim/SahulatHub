const express = require('express');
const {
    createReview,
    getWorkerReviews,
    getMyReviews,
    getReceivedReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// POST /api/reviews          — client submits a review for a completed task
router.post('/', protect, authorizeRoles('client'), createReview);

// GET  /api/reviews/my       — client sees reviews they have written
router.get('/my', protect, authorizeRoles('client'), getMyReviews);

// GET  /api/reviews/received — worker sees reviews written about them
router.get('/received', protect, authorizeRoles('worker'), getReceivedReviews);

// GET  /api/reviews/worker/:workerId — public profile reviews (no auth needed)
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
