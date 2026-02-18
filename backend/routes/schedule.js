const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

function logError(error) {
    const logPath = path.join(__dirname, '../error.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] SCHEDULE ERROR: ${error.stack || error}\n`;
    fs.appendFileSync(logPath, logMessage);
}

// Get my off days
router.get('/off-days', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Optionally filter by month/year if needed, for now get all upcoming (or recent)
        // Let's get all future off days + past 30 days
        const result = await pool.query(
            `SELECT id, off_date 
             FROM user_off_days 
             WHERE user_id = $1 
               AND off_date >= CURRENT_DATE - INTERVAL '30 days'
             ORDER BY off_date ASC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get off days error:', error);
        logError(error);
        res.status(500).json({ error: error.message || 'Terjadi kesalahan server' });
    }
});

// Add off days
router.post('/off-days', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { off_dates } = req.body; // Array of dates 'YYYY-MM-DD'

        if (!off_dates || !Array.isArray(off_dates) || off_dates.length === 0) {
            return res.status(400).json({ error: 'Daftar tanggal harus diisi' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const date of off_dates) {
                // Insert if not exists
                const result = await client.query(
                    `INSERT INTO user_off_days (user_id, off_date) 
                     VALUES ($1, $2) 
                     ON CONFLICT (user_id, off_date) DO NOTHING
                     RETURNING id, off_date`,
                    [userId, date]
                );
                if (result.rows[0]) {
                    results.push(result.rows[0]);
                }
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Tanggal libur berhasil ditambahkan', data: results });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Add off days error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Delete off day
router.delete('/off-days/:date', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        await pool.query(
            `DELETE FROM user_off_days WHERE user_id = $1 AND off_date = $2`,
            [userId, date]
        );

        res.json({ message: 'Tanggal libur berhasil dihapus' });
    } catch (error) {
        console.error('Delete off day error:', error);
        logError(error);
        res.status(500).json({ error: error.message || 'Terjadi kesalahan server' });
    }
});

module.exports = router;
