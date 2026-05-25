const mysql = require('mysql2');
require('dotenv').config();

// Parse connection string from environment or use direct values
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: process.env.DB_USER || '2dxbkTjDhhN9c1Q.root',
    password: process.env.DB_PASSWORD || 'fhpBrID1l7Y5MVJT',
    database: process.env.DB_NAME || 'FORMFLOW_DB',
    port: 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully!');
        connection.release();
    }
});

module.exports = pool.promise();