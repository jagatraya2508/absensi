require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('./index');

async function createSettingsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(50) UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Settings table created or already exists.');

        // Insert default logo if not exists
        const result = await pool.query("SELECT * FROM settings WHERE key = 'app_logo'");
        if (result.rows.length === 0) {
            await pool.query("INSERT INTO settings (key, value) VALUES ('app_logo', '/logo.png')");
            console.log('Default logo configuration inserted.');
        }
    } catch (err) {
        console.error('Error creating settings table:', err);
    } finally {
        // We don't exit here if it's imported, but if run directly we might
        if (require.main === module) {
            process.exit(0);
        }
    }
}

if (require.main === module) {
    createSettingsTable();
}

module.exports = { createSettingsTable };
