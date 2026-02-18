const { pool } = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration...');

        // Create user_off_days table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_off_days (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                off_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, off_date)
            );
        `);
        console.log('Created user_off_days table');

        // Allow null for off_day in users table if we are deprecating it, 
        // effectively making it optional or unused.
        // We won't drop it yet to avoid breaking existing data immediately if user wants to revert.

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
