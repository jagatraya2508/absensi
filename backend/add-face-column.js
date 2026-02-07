const { pool } = require('./db');

async function addFaceColumn() {
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS face_descriptor TEXT
        `);
        console.log('Added face_descriptor column to users table');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addFaceColumn();
