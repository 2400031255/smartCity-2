const router = require('express').Router();
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');

const VALID_STATUS   = ['pending', 'resolved', 'completed'];
const VALID_PRIORITY = ['low', 'medium', 'high'];
const LIST_COLS = 'id, user_name, name, phone, category, location, description, status, priority, solution, rating, solution_viewed, resolved_viewed, created_at, updated_at';

router.get('/', auth, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? `SELECT ${LIST_COLS} FROM issues ORDER BY created_at DESC`
            : `SELECT ${LIST_COLS} FROM issues WHERE user_name = ? ORDER BY created_at DESC`;
        const params = req.user.role === 'admin' ? [] : [req.user.name];
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
    const { name, phone, category, location, description, photo } = req.body;
    if (!name || !phone || !category || !location || !description)
        return res.status(400).json({ error: 'All fields are required' });
    if (!/^[0-9]{10}$/.test(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
    if (description.trim().length < 10) return res.status(400).json({ error: 'Description too short' });
    try {
        const [result] = await pool.query(
            'INSERT INTO issues (user_name, name, phone, category, location, description, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.name, name.trim(), phone, category, location.trim(), description.trim(), photo || null]);
        res.status(201).json({ id: result.insertId, message: 'Issue reported' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
    const { status, solution, rating, priority, solution_viewed, resolved_viewed } = req.body;
    if (status   && !VALID_STATUS.includes(status))
        return res.status(400).json({ error: `status must be one of: ${VALID_STATUS.join(', ')}` });
    if (priority && !VALID_PRIORITY.includes(priority))
        return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITY.join(', ')}` });
    if (rating !== undefined && (rating < 1 || rating > 5))
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
    const updates = [], params = [];
    if (status             !== undefined) { updates.push('status = ?');          params.push(status); }
    if (solution           !== undefined) { updates.push('solution = ?');        params.push(solution); }
    if (rating             !== undefined) { updates.push('rating = ?');          params.push(rating); }
    if (priority           !== undefined) { updates.push('priority = ?');        params.push(priority); }
    if (solution_viewed    !== undefined) { updates.push('solution_viewed = ?'); params.push(solution_viewed ? 1 : 0); }
    if (resolved_viewed    !== undefined) { updates.push('resolved_viewed = ?'); params.push(resolved_viewed ? 1 : 0); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.id);
    try {
        const [result] = await pool.query(`UPDATE issues SET ${updates.join(', ')} WHERE id = ?`, params);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Issue not found' });
        res.json({ message: 'Issue updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_name FROM issues WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
        if (req.user.role !== 'admin' && rows[0].user_name !== req.user.name)
            return res.status(403).json({ error: 'Forbidden' });
        await pool.query('DELETE FROM issues WHERE id = ?', [req.params.id]);
        res.json({ message: 'Issue deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
