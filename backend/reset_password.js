const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
    user: 'wisnu',
    host: 'localhost',
    database: 'absensi',
    password: 'Admin2026',
    port: 5432,
});

async function reset() {
    try {
        await client.connect();
        const password = '123456';
        const hash = await bcrypt.hash(password, 10);
        console.log('Generated Hash:', hash);

        const match = await bcrypt.compare(password, hash);
        console.log('Verification:', match ? 'SUCCESS' : 'FAILED');

        if (match) {
            await client.query('UPDATE users SET password = $1 WHERE employee_id = $2', [hash, 'K001']);
            await client.query('UPDATE users SET password = $1 WHERE employee_id = $2', [hash, 'ADMIN001']);
            console.log('Database updated for K001 and ADMIN001');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

reset();
