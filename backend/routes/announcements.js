const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all active announcements (for User Dashboard)
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, content, created_at 
             FROM announcements 
             WHERE is_active = true 
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all announcements (for Admin)
router.get('/', authenticateToken, async (req, res) => {
    // Check if admin
    if (req.user.role !== 'admin') {
        const result = await pool.query(
            `SELECT id, title, content, created_at 
             FROM announcements 
             WHERE is_active = true 
             ORDER BY created_at DESC LIMIT 5`
        );
        return res.json(result.rows);
    }

    try {
        const result = await pool.query(
            `SELECT a.*, u.name as creator_name 
             FROM announcements a
             LEFT JOIN users u ON a.created_by = u.id
             ORDER BY a.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create announcement (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { title, content, is_active } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO announcements (title, content, is_active, created_by)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, content, is_active ?? true, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update announcement
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;
    const { title, content, is_active } = req.body;

    try {
        const result = await pool.query(
            `UPDATE announcements 
             SET title = $1, content = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [title, content, is_active, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete announcement
router.delete('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;

    try {
        await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
