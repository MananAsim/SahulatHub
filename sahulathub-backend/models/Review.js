const mongoose = require('mongoose');

/**
 * Review Schema
 * ─────────────────────────────────────────────────────────────────────────────
 * - One review per task (task_id is unique → enforced at DB level)
 * - Reviewer must be the client who created the task
 * - Reviewee is the worker who was assigned to the task
 * ─────────────────────────────────────────────────────────────────────────────
 */
const reviewSchema = new mongoose.Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: [true, 'task_id is required'],
            unique: true, // one review per task
        },
        reviewer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'reviewer_id is required'],
        },
        reviewee_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'reviewee_id (worker) is required'],
        },
        rating: {
            type: Number,
            required: [true, 'rating is required'],
            min: [1, 'Minimum rating is 1'],
            max: [5, 'Maximum rating is 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
