import { useState, useEffect } from 'react';
import { attendanceAPI } from '../utils/api';

export default function History() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const data = await attendanceAPI.getHistory(params);
            setRecords(data || []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError(err.message || 'Gagal memuat riwayat absensi');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }

    function handleFilter(e) {
        e.preventDefault();
        fetchHistory();
    }

    function formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Group records by date
    const groupedRecords = Array.isArray(records) ? records.reduce((acc, record) => {
        if (record && record.recorded_at) {
            const date = new Date(record.recorded_at).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(record);
        }
        return acc;
    }, {}) : {};

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📋 Riwayat Absensi</h1>
                <p className="page-subtitle">Lihat riwayat absensi Anda</p>
            </div>

            {/* Filter */}
            <div className="card mb-4">
                <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tanggal Mulai</label>
                        <input
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tanggal Akhir</label>
                        <input
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        🔍 Filter
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setTimeout(fetchHistory, 0);
                        }}
                    >
                        Reset
                    </button>
                </form>
            </div>

            {error && (
                <div className="alert alert-danger mb-3">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                </div>
            ) : records.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p className="empty-state-text">Tidak ada riwayat absensi</p>
                    </div>
                </div>
            ) : (
                Object.entries(groupedRecords).map(([date, dayRecords]) => (
                    <div key={date} className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title" style={{ fontSize: '1rem' }}>
                                {formatDate(dayRecords[0].recorded_at)}
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dayRecords.map((record) => (
                                <div
                                    key={record.id}
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}
                                >
                                    <img
                                        src={record.photo_path}
                                        alt={record.type}
                                        className="photo-thumb-lg"
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span className={`badge ${record.type === 'check_in' ? 'badge-primary' : 'badge-warning'}`}>
                                                {record.type === 'check_in' ? '📥 Masuk' : '📤 Pulang'}
                                            </span>
                                            <span style={{ fontWeight: 600 }}>{formatTime(record.recorded_at)}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
                                            📍 {record.location_name || 'Lokasi tidak diketahui'}
                                        </div>
                                        {record.notes && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)', marginTop: '0.25rem' }}>
                                                💬 {record.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge ${record.is_valid ? 'badge-success' : 'badge-warning'}`}>
                                            {record.is_valid ? '✓ Valid' : `⚠ ${Math.round(record.distance_meters || 0)}m`}
                                        </span>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                                            {record.latitude ? parseFloat(record.latitude).toFixed(4) : '-'}, {record.longitude ? parseFloat(record.longitude).toFixed(4) : '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
