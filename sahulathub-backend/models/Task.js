const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        radius: {
            type: Number, // in kilometers
            default: 10,
        },
        budget: {
            type: Number, // in PKR (Rs)
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
            default: 'open',
        },
        client_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assigned_worker_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
