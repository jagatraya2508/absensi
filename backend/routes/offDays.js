const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get off days for a specific user (Admin only)
router.get('/:userId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            'SELECT * FROM user_off_days WHERE user_id = $1 ORDER BY off_date DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get user off days error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Add off day for a user (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { user_id, date } = req.body;

        if (!user_id || !date) {
            return res.status(400).json({ error: 'User ID dan tanggal harus diisi' });
        }

        const result = await pool.query(
            `INSERT INTO user_off_days (user_id, off_date) 
             VALUES ($1, $2) 
             RETURNING *`,
            [user_id, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add user off day error:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Tanggal libur sudah ada untuk user ini' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Delete off day (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM user_off_days WHERE id = $1', [id]);
        res.json({ message: 'Tanggal libur berhasil dihapus' });
    } catch (error) {
        console.error('Delete user off day error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
