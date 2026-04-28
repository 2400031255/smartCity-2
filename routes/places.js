const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, image, description, address, icon, created_at FROM tourist_places ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
    const { name, image, description, address, icon } = req.body;
    if (!name || !image || !description || !address)
        return res.status(400).json({ error: 'Name, image, description and address are required' });
    try {
        const [result] = await pool.query(
            'INSERT INTO tourist_places (name, image, description, address, icon) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), image.trim(), description.trim(), address.trim(), icon || '🏛️']);
        res.status(201).json({ id: result.insertId, message: 'Place added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
    const { name, image, description, address, icon } = req.body;
    if (!name || !image || !description || !address)
        return res.status(400).json({ error: 'Name, image, description and address are required' });
    try {
        const [result] = await pool.query(
            'UPDATE tourist_places SET name=?, image=?, description=?, address=?, icon=? WHERE id=?',
            [name.trim(), image.trim(), description.trim(), address.trim(), icon || '🏛️', req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Place not found' });
        res.json({ message: 'Place updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tourist_places WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Place not found' });
        res.json({ message: 'Place deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
