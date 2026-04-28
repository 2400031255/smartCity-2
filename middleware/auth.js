const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'smart-city-secret-key-2024';

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
};

module.exports = { auth, adminOnly };
