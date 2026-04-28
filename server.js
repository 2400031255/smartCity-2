const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 8080;

console.log('Starting server with PORT:', PORT);
console.log('ENV vars:', {
    MYSQLHOST:     process.env.MYSQLHOST     ? 'SET' : 'NOT SET',
    MYSQLPORT:     process.env.MYSQLPORT     ? 'SET' : 'NOT SET',
    MYSQLUSER:     process.env.MYSQLUSER     ? 'SET' : 'NOT SET',
    MYSQLPASSWORD: process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET',
    MYSQLDATABASE: process.env.MYSQLDATABASE ? 'SET' : 'NOT SET',
    NODE_ENV:      process.env.NODE_ENV
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Health checks
app.get('/health',     (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api',           require('./routes/auth'));
app.use('/api/issues',    require('./routes/issues'));
app.use('/api/places',    require('./routes/places'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/buses',     require('./routes/buses'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/users',     require('./routes/users'));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

initDB()
    .then(() => console.log('✅ Database initialized'))
    .catch(err => {
        console.error('❌ DB init failed:', err.message);
        console.error('Check MySQL env variables: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE');
    });
