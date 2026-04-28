const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:name', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.name !== req.params.name)
        return res.status(403).json({ error: 'Forbidden' });
    const { phone, password, avatar_img } = req.body;
    if (phone && !/^[0-9]{10}$/.test(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
    if (password && password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const updates = [], params = [];
    if (phone)      { updates.push('phone = ?');      params.push(phone); }
    if (password)   { updates.push('password = ?');   params.push(await bcrypt.hash(password, 10)); }
    if (avatar_img) { updates.push('avatar_img = ?'); params.push(avatar_img); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.name);
    try {
        const [result] = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE name = ?`, params);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:name', auth, adminOnly, async (req, res) => {
    if (req.params.name === req.user.name)
        return res.status(400).json({ error: 'Cannot delete your own account' });
    try {
        const [result] = await pool.query('DELETE FROM users WHERE name = ?', [req.params.name]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
