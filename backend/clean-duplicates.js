const { pool } = require('./db');

async function cleanDuplicates() {
    try {
        const result = await pool.query(`
            DELETE FROM attendance_locations 
            WHERE id NOT IN (
                SELECT MIN(id) 
                FROM attendance_locations 
                GROUP BY name, latitude, longitude
            )
        `);
        console.log('Deleted', result.rowCount, 'duplicate locations');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

cleanDuplicates();
