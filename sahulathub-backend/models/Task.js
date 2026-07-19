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
            enum: ['open', 'assigned', 'in_progress', 'pending_client_confirmation', 'completed', 'cancelled'],
            default: 'open',
        },
        payment_status: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
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
        demo_worker: {
            type: Object,
            default: null, // Stores { worker_id, worker_name, worker_skill } for AI matches
        },
        chat: [
            {
                sender: { type: String, enum: ['client', 'worker', 'ai'] },
                text: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
