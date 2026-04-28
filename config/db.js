const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    host:     process.env.MYSQLHOST     || process.env.MYSQL_HOST     || '127.0.0.1',
    port:     process.env.MYSQLPORT     || process.env.MYSQL_PORT     || 3306,
    user:     process.env.MYSQLUSER     || process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'nikhil140218',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.MYSQL_DB || 'smartcity',
    waitForConnections: true,
    connectionLimit: 10,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}).promise();

async function initDB() {
    const tempConn = mysql.createConnection({
        host:     process.env.MYSQLHOST     || process.env.MYSQL_HOST     || '127.0.0.1',
        port:     process.env.MYSQLPORT     || process.env.MYSQL_PORT     || 3306,
        user:     process.env.MYSQLUSER     || process.env.MYSQL_USER     || 'root',
        password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'nikhil140218',
    }).promise();

    const dbName = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.MYSQL_DB || 'smartcity';
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConn.end();
    console.log(`✅ Database "${dbName}" ready`);

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100) UNIQUE NOT NULL,
        phone      VARCHAR(15),
        password   VARCHAR(255) NOT NULL,
        role       ENUM('user','admin') DEFAULT 'user',
        avatar_img LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS issues (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        user_name        VARCHAR(100) NOT NULL,
        name             VARCHAR(100) NOT NULL,
        phone            VARCHAR(15)  NOT NULL,
        category         VARCHAR(50)  NOT NULL,
        location         TEXT         NOT NULL,
        description      TEXT         NOT NULL,
        photo            LONGTEXT,
        status           ENUM('pending','resolved','completed') DEFAULT 'pending',
        priority         ENUM('low','medium','high')            DEFAULT 'medium',
        solution         TEXT,
        rating           TINYINT UNSIGNED,
        solution_viewed  TINYINT(1) DEFAULT 0,
        resolved_viewed  TINYINT(1) DEFAULT 0,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_name  (user_name),
        INDEX idx_status     (status),
        INDEX idx_created_at (created_at)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS tourist_places (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        image       LONGTEXT     NOT NULL,
        description TEXT         NOT NULL,
        address     TEXT         NOT NULL,
        icon        VARCHAR(10)  DEFAULT '🏛️',
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS emergency_numbers (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        service  VARCHAR(100) NOT NULL,
        number   VARCHAR(20)  NOT NULL,
        address  TEXT,
        map_link TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS buses (
        id     INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(20)  NOT NULL,
        route  TEXT         NOT NULL,
        time   VARCHAR(100) NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS alerts (
        id      INT AUTO_INCREMENT PRIMARY KEY,
        type    ENUM('warning','info','success') NOT NULL,
        message TEXT   NOT NULL,
        time    BIGINT NOT NULL,
        INDEX idx_time (time)
    )`);

    // Seed admins
    for (const [uname, upass, uphone] of [
        ['nikhil',   'nikhil2006',   '0000000000'],
        ['srisanth', 'srisanth2007', '2222222222'],
    ]) {
        const [rows] = await pool.query("SELECT id FROM users WHERE name=? AND role='admin'", [uname]);
        if (rows.length === 0) {
            const hashed = await bcrypt.hash(upass, 10);
            await pool.query("INSERT INTO users (name, phone, password, role) VALUES (?,?,?,'admin')", [uname, uphone, hashed]);
            console.log(`✅ Admin created (${uname} / ${upass})`);
        }
    }

    // Seed default user
    const [users] = await pool.query("SELECT id FROM users WHERE name='user' AND role='user'");
    if (users.length === 0) {
        const hashed = await bcrypt.hash('user123', 10);
        await pool.query("INSERT INTO users (name, phone, password, role) VALUES (?,?,?,'user')", ['user', '1111111111', hashed]);
        console.log('✅ Default user created (user / user123)');
    }

    console.log('✅ All tables ready');
}

module.exports = { pool, initDB };
