const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get daily report (Admin only)
router.get('/daily', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT 
        u.id as user_id,
        u.employee_id,
        u.name,
        ci.recorded_at as check_in_time,
        ci.photo_path as check_in_photo,
        ci.latitude as check_in_lat,
        ci.longitude as check_in_lng,
        ci.distance_meters as check_in_distance,
        ci.is_valid as check_in_valid,
        co.recorded_at as check_out_time,
        co.photo_path as check_out_photo,
        co.latitude as check_out_lat,
        co.longitude as check_out_lng,
        co.distance_meters as check_out_distance,
        co.is_valid as check_out_valid,
        al.name as location_name
      FROM users u
      LEFT JOIN attendance_records ci ON u.id = ci.user_id 
        AND ci.type = 'check_in' 
        AND DATE(ci.recorded_at) = $1
      LEFT JOIN attendance_records co ON u.id = co.user_id 
        AND co.type = 'check_out' 
        AND DATE(co.recorded_at) = $1
      LEFT JOIN attendance_locations al ON COALESCE(ci.location_id, co.location_id) = al.id
      WHERE u.role = 'employee'
      ORDER BY u.name`,
            [targetDate]
        );

        const summary = {
            date: targetDate,
            total_employees: result.rows.length,
            present: result.rows.filter(r => r.check_in_time).length,
            absent: result.rows.filter(r => !r.check_in_time).length,
            completed: result.rows.filter(r => r.check_in_time && r.check_out_time).length
        };

        res.json({
            summary,
            records: result.rows
        });
    } catch (error) {
        console.error('Get daily report error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Get monthly report (Admin only)
router.get('/monthly', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { year, month } = req.query;
        const targetYear = parseInt(year) || new Date().getFullYear();
        const targetMonth = parseInt(month) || new Date().getMonth() + 1;

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT 
        u.id as user_id,
        u.employee_id,
        u.name,
        COUNT(DISTINCT CASE WHEN ar.type = 'check_in' THEN DATE(ar.recorded_at) END) as total_present,
        COUNT(DISTINCT CASE WHEN ar.type = 'check_in' AND ar.is_valid = true THEN DATE(ar.recorded_at) END) as valid_checkins,
        COUNT(DISTINCT CASE WHEN ar.type = 'check_in' AND ar.is_valid = false THEN DATE(ar.recorded_at) END) as invalid_checkins
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id 
        AND DATE(ar.recorded_at) BETWEEN $1 AND $2
      WHERE u.role = 'employee'
      GROUP BY u.id, u.employee_id, u.name
      ORDER BY u.name`,
            [startDate, endDate]
        );

        // Calculate working days in the month
        const workingDays = getWorkingDays(targetYear, targetMonth);

        const records = result.rows.map(r => ({
            ...r,
            total_absent: workingDays - parseInt(r.total_present),
            attendance_rate: Math.round((parseInt(r.total_present) / workingDays) * 100)
        }));

        res.json({
            year: targetYear,
            month: targetMonth,
            working_days: workingDays,
            records
        });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Get individual employee report
router.get('/employee/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.query;

        // Only allow admin or the employee themselves
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }

        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT 
        ar.*,
        al.name as location_name
      FROM attendance_records ar
      LEFT JOIN attendance_locations al ON ar.location_id = al.id
      WHERE ar.user_id = $1 
        AND DATE(ar.recorded_at) BETWEEN $2 AND $3
      ORDER BY ar.recorded_at DESC`,
            [id, start_date || thirtyDaysAgo, end_date || today]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get employee report error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Helper function to calculate working days (excluding weekends)
function getWorkingDays(year, month) {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            count++;
        }
    }

    return count;
}

module.exports = router;
