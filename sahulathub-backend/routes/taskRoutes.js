const express = require('express');
const {
    createTask,
    getAvailableTasks,
    getWorkerTasks,
    updateTaskStatus,
    getUserTasks,
    getTaskById,
    assignTask,
    assignDemoTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// @route   POST /api/tasks          — client creates a task
router.post('/', protect, authorizeRoles('client', 'admin'), createTask);

// @route   GET /api/tasks/available — worker sees all open tasks
router.get('/available', protect, authorizeRoles('worker', 'admin'), getAvailableTasks);

// @route   GET /api/tasks/worker    — worker sees only THEIR assigned tasks
router.get('/worker', protect, authorizeRoles('worker'), getWorkerTasks);

// @route   GET /api/tasks/my        — role-filtered: client sees their tasks, worker sees assigned
router.get('/my', protect, getUserTasks);

// @route   GET /api/tasks/:id       — single task detail
router.get('/:id', protect, getTaskById);

// @route   PATCH /api/tasks/:id/status
router.patch('/:id/status', protect, updateTaskStatus);

// @route   POST /api/tasks/:id/assign — client picks a real DB worker
router.post('/:id/assign', protect, authorizeRoles('client'), assignTask);

// @route   POST /api/tasks/:id/assign-demo — client picks a CSV demo worker
router.post('/:id/assign-demo', protect, authorizeRoles('client'), assignDemoTask);

module.exports = router;
