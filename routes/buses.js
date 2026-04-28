const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, number, route, time FROM buses ORDER BY number');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
    const { number, route, time } = req.body;
    if (!number || !route || !time) return res.status(400).json({ error: 'Bus number, route and time are required' });
    try {
        const [result] = await pool.query('INSERT INTO buses (number, route, time) VALUES (?, ?, ?)',
            [number.trim(), route.trim(), time.trim()]);
        res.status(201).json({ id: result.insertId, message: 'Bus added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
    const { number, route, time } = req.body;
    if (!number || !route || !time) return res.status(400).json({ error: 'Bus number, route and time are required' });
    try {
        const [result] = await pool.query('UPDATE buses SET number=?, route=?, time=? WHERE id=?',
            [number.trim(), route.trim(), time.trim(), req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Bus not found' });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM buses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Bus not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
