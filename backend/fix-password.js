const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function updateAdminPassword() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await pool.query(
            'UPDATE users SET password = $1 WHERE employee_id = $2',
            [hash, 'ADMIN001']
        );
        console.log('Admin password updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdminPassword();
