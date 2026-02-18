const { pool } = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add replacement_date column
        await pool.query(`
            ALTER TABLE leave_requests 
            ADD COLUMN IF NOT EXISTS replacement_date DATE;
        `);
        console.log('Added replacement_date column');

        // Update type constraint
        await pool.query(`
            ALTER TABLE leave_requests 
            DROP CONSTRAINT IF EXISTS leave_requests_type_check;
        `);

        await pool.query(`
            ALTER TABLE leave_requests 
            ADD CONSTRAINT leave_requests_type_check 
            CHECK (type IN ('late', 'sick', 'leave', 'change_off'));
        `);
        console.log('Updated type constraint');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
