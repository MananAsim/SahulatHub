const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (client only)
const createTask = async (req, res) => {
    try {
        const { title, description, category, urgency, location, radius } = req.body;

        if (!title || !description || !category || !location) {
            return res.status(400).json({
                success: false,
                message: 'title, description, category, and location are required',
            });
        }

        const task = await Task.create({
            title,
            description,
            category,
            urgency: urgency || 'medium',
            location,
            radius: radius || 10,
            client_id: req.user.id,
            status: 'open',
        });

        res.status(201).json({ success: true, message: 'Task created successfully', data: task });
    } catch (error) {
        console.error('Create Task Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all open tasks (for workers to browse)
// @route   GET /api/tasks/available
// @access  Private (worker only)
const getAvailableTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ status: 'open' })
            .populate('client_id', 'name email rating location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        console.error('Get Available Tasks Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all tasks assigned to the authenticated worker
// @route   GET /api/tasks/worker
// @access  Private (worker only)
//
// Uses req.user.id from JWT or DEV_MODE header — never hardcoded.
const getWorkerTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assigned_worker_id: req.user.id })
            .populate('client_id', 'name email phone rating location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        console.error('Get Worker Tasks Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private (client or worker)
const updateTaskStatus = async (req, res) => {
    try {
        const { status, assigned_worker_id } = req.body;

        const validStatuses = ['open', 'assigned', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Only client who created the task or admin can cancel
        if (status === 'cancelled') {
            if (task.client_id.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized to cancel this task' });
            }
        }

        task.status = status;
        if (assigned_worker_id) task.assigned_worker_id = assigned_worker_id;

        await task.save();

        res.status(200).json({ success: true, message: 'Task status updated', data: task });
    } catch (error) {
        console.error('Update Task Status Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get tasks for the logged-in user (client sees their tasks, worker sees assigned tasks)
// @route   GET /api/tasks/my
// @access  Private
const getUserTasks = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'client') {
            query = { client_id: req.user.id };
        } else if (req.user.role === 'worker') {
            query = { assigned_worker_id: req.user.id };
        } else if (req.user.role === 'admin') {
            query = {}; // admin sees all tasks
        } else {
            return res.status(403).json({ success: false, message: 'Invalid role' });
        }

        const tasks = await Task.find(query)
            .populate('client_id', 'name email')
            .populate('assigned_worker_id', 'name email phone rating')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        console.error('Get User Tasks Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('client_id', 'name email rating')
            .populate('assigned_worker_id', 'name email phone rating skills');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error('Get Task By ID Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Assign a task to a specific worker
// @route   POST /api/tasks/:id/assign
// @access  Private (client only)
const assignTask = async (req, res) => {
    try {
        const { worker_id, budget } = req.body;

        if (!worker_id) {
            return res.status(400).json({ success: false, message: 'worker_id is required' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Only the client who created the task can assign it
        if (task.client_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to assign this task' });
        }

        if (task.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: `Task is already ${task.status} and cannot be assigned`,
            });
        }

        // Verify the worker exists
        const worker = await User.findById(worker_id);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        // Assign task
        task.assigned_worker_id = worker_id;
        task.status = 'assigned';
        if (budget !== undefined) task.budget = budget;
        await task.save();

        // Mark worker as unavailable
        await User.findByIdAndUpdate(worker_id, { availability: false });

        const populated = await Task.findById(task._id)
            .populate('client_id', 'name email')
            .populate('assigned_worker_id', 'name email phone rating skills');

        res.status(200).json({
            success: true,
            message: `Task assigned to ${worker.name}`,
            data: populated,
        });
    } catch (error) {
        console.error('Assign Task Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Assign a task to a CSV demo worker (no DB user record needed)
// @route   POST /api/tasks/:id/assign-demo
// @access  Private (client only)
const assignDemoTask = async (req, res) => {
    try {
        const { worker_name, worker_skill, worker_id } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.client_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        task.status = 'assigned';
        task.demo_worker = { worker_id, worker_name, worker_skill }; // store as metadata
        await task.save();

        res.status(200).json({
            success: true,
            message: `Task assigned to demo worker: ${worker_name}`,
            data: task,
        });
    } catch (error) {
        console.error('Assign Demo Task Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { createTask, getAvailableTasks, getWorkerTasks, updateTaskStatus, getUserTasks, getTaskById, assignTask, assignDemoTask };

