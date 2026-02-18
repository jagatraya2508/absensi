const { pool } = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add off_day column to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS off_day VARCHAR(20) DEFAULT 'Minggu';
        `);
        console.log('Added off_day column to users table');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
