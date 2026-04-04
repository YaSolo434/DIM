const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
require('dotenv').config();

// Registration route
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert the user into DB with password
        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
            [first_name, last_name, email, password]
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verify User Exists
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password matching (Plaintext comparison since encryption is removed)
        const isMatch = (password === user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT Payload
        const payload = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name
        };

        // Sign Token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' });

        // Send token mapped in Cookie
        res.cookie('token', token, {
            httpOnly: true,     // Accessible only by the web server
            secure: true,       // Required for SameSite=None
            sameSite: 'none',   // Allows cross-site cookie usage
            maxAge: 3600000     // 1 Hour
        });

        res.json({ message: 'Logged in successfully', user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: 'Logged out successfully' });
});

// Example of a Protected Route (requires valid JWT in cookie)
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userQuery = await pool.query('SELECT id, first_name, last_name, email, created_at FROM users WHERE id = $1', [req.user.id]);
        res.json(userQuery.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
