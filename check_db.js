const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const { pool } = require('./backend/db');

async function checkTables() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Connected to DB. Tables found:', res.rows.map(r => r.table_name));

        const dbName = await client.query('SELECT current_database()');
        console.log('Current Database:', dbName.rows[0].current_database);

        client.release();
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        pool.end();
    }
}

checkTables();
