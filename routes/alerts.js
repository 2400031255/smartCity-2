const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

const VALID_TYPES = ['warning', 'info', 'success'];

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, type, message, time FROM alerts ORDER BY time DESC LIMIT 10');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
    const { type, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Type must be warning, info or success' });
    try {
        const [result] = await pool.query('INSERT INTO alerts (type, message, time) VALUES (?, ?, ?)',
            [type, message.trim(), Date.now()]);
        res.status(201).json({ id: result.insertId, message: 'Alert added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
    const { type, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Type must be warning, info or success' });
    try {
        const [result] = await pool.query('UPDATE alerts SET type=?, message=? WHERE id=?',
            [type, message.trim(), req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM alerts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
