const Review = require('../models/Review');
const Task = require('../models/Task');
const User = require('../models/User');

// ─── Helper: recalculate and save worker's average rating ─────────────────────
const _recalcWorkerRating = async (workerId) => {
    const reviews = await Review.find({ reviewee_id: workerId });
    if (!reviews.length) return;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(workerId, { rating: parseFloat(avg.toFixed(2)) });
};


// @desc    Submit a review for a completed task's worker
// @route   POST /api/reviews
// @access  Private (client only)
const createReview = async (req, res) => {
    try {
        const { task_id, rating, comment } = req.body;

        if (!task_id || !rating) {
            return res.status(400).json({ success: false, message: 'task_id and rating are required' });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
        }

        // Fetch task from DB
        const task = await Task.findById(task_id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Validate task is completed
        if (task.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'You can only review a completed task',
            });
        }

        // Validate the requester is the client who created this task
        if (task.client_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the client who created this task can leave a review',
            });
        }

        // Validate a worker was assigned
        if (!task.assigned_worker_id) {
            return res.status(400).json({ success: false, message: 'No worker was assigned to this task' });
        }

        // Create review (unique per task enforced by schema)
        const review = await Review.create({
            task_id,
            reviewer_id: req.user.id,
            reviewee_id: task.assigned_worker_id,
            rating: numRating,
            comment: comment || '',
        });

        // Recalculate and persist worker's average rating
        await _recalcWorkerRating(task.assigned_worker_id);

        const populated = await Review.findById(review._id)
            .populate('reviewer_id', 'name email')
            .populate('reviewee_id', 'name rating');

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'You have already reviewed this task' });
        }
        console.error('Create Review Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Get all reviews for a specific worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee_id: req.params.workerId })
            .populate('reviewer_id', 'name')
            .populate('task_id', 'title category')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('Get Worker Reviews Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Get reviews left by the logged-in client
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewer_id: req.user.id })
            .populate('reviewee_id', 'name rating skills')
            .populate('task_id', 'title category status')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('Get My Reviews Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Get all reviews received by the logged-in worker
// @route   GET /api/reviews/received
// @access  Private (worker)
const getReceivedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee_id: req.user.id })
            .populate('reviewer_id', 'name')
            .populate('task_id', 'title category')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('Get Received Reviews Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { createReview, getWorkerReviews, getMyReviews, getReceivedReviews };
