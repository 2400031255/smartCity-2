const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, service, number, address, map_link FROM emergency_numbers ORDER BY service');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
    const { service, number, address, map_link } = req.body;
    if (!service || !number) return res.status(400).json({ error: 'Service name and number are required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO emergency_numbers (service, number, address, map_link) VALUES (?, ?, ?, ?)',
            [service.trim(), number.trim(), address || null, map_link || null]);
        res.status(201).json({ id: result.insertId, message: 'Emergency number added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
    const { service, number, address, map_link } = req.body;
    if (!service || !number) return res.status(400).json({ error: 'Service name and number are required' });
    try {
        const [result] = await pool.query(
            'UPDATE emergency_numbers SET service=?, number=?, address=?, map_link=? WHERE id=?',
            [service.trim(), number.trim(), address || null, map_link || null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Emergency number not found' });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM emergency_numbers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Emergency number not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
