const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'smart-city-secret-key-2024';

router.post('/register', async (req, res) => {
    const { name, phone, password, role } = req.body;
    if (!name || !password) return res.status(400).json({ error: 'Name and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (phone && !/^[0-9]{10}$/.test(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
    try {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)',
            [name.trim(), phone || null, hashed, role === 'admin' ? 'admin' : 'user']);
        res.json({ message: 'User created' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already taken' });
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    const { name, password, role } = req.body;
    if (!name || !password) return res.status(400).json({ error: 'Name and password required' });
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE name = ? AND role = ?', [name, role || 'user']);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, role: user.role, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
