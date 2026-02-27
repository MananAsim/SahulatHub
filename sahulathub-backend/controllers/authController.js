const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (client or worker)
// @route   POST /api/auth/register
// @access  Public
//
// Supports two registration paths:
//   - Client:  email + password (required)
//   - Worker:  email + password (required) OR phone + password (required)
//              skills[] and location are accepted for workers
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role, location, skills, availability } = req.body;

        // ── Basic validation ──────────────────────────────────────────────────
        if (!name || !password) {
            return res.status(400).json({ success: false, message: 'Name and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const allowedRoles = ['client', 'worker'];
        const userRole = allowedRoles.includes(role) ? role : 'client';

        // ── Role-specific validation ───────────────────────────────────────────
        if (userRole === 'worker') {
            // Worker can register with email OR phone (at least one required)
            if (!email && !phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Workers must provide either email or phone number',
                });
            }
        } else {
            // Client requires email
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required for client registration' });
            }
        }

        // ── Duplicate checks ─────────────────────────────────────────────────
        if (email) {
            const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'Email is already registered' });
            }
        }
        if (phone) {
            const normalizedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;
            const existingPhone = await User.findOne({ phone: normalizedPhone });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'Phone number is already registered' });
            }
        }

        // ── Create user via .save() so pre-save bcrypt hook fires ─────────────
        const normalizedPhone = phone
            ? (phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`)
            : undefined;

        const user = new User({
            name: name.trim(),
            email: email ? email.toLowerCase().trim() : undefined,
            phone: normalizedPhone,
            password, // pre-save hook in User model hashes this
            role: userRole,
            location: location || { lat: 0, lng: 0 },
            skills: skills || [],
            availability: availability !== undefined ? availability : true,
        });

        await user.save();

        const token = generateToken({ id: user._id, role: user.role });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                rating: user.rating,
                location: user.location,
                skills: user.skills,
                availability: user.availability,
            },
            token,
        });
    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Login client (or admin) with email + password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find user and include password field for comparison
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                rating: user.rating,
                location: user.location,
                skills: user.skills,
                availability: user.availability,
            },
            token,
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Login worker with phone number + password
// @route   POST /api/auth/worker-login
// @access  Public
const workerLogin = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide phone number and password' });
        }

        // Normalize phone: '03001234567' → '+923001234567'
        const normalizedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;

        // Find worker by phone and include password for comparison
        const user = await User.findOne({ phone: normalizedPhone, role: 'worker' }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.status(200).json({
            success: true,
            message: 'Worker login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                rating: user.rating,
                location: user.location,
                skills: user.skills,
                availability: user.availability,
            },
            token,
        });
    } catch (error) {
        console.error('Worker Login Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, workerLogin, getMe };
