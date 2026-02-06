import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../utils/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [todayStatus, setTodayStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [statusData, historyData] = await Promise.all([
                attendanceAPI.getToday(),
                attendanceAPI.getHistory({ limit: 10 })
            ]);
            setTodayStatus(statusData);
            setHistory(historyData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div className="loading-overlay" style={{ position: 'relative', minHeight: '50vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Selamat Datang, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="page-subtitle">{today}</p>
            </div>

            {/* Status Absensi Hari Ini */}
            <div className="grid grid-2 mb-4">
                <div className="card status-card">
                    <div className={`status-card-icon ${todayStatus?.checked_in ? 'success' : 'warning'}`}>
                        {todayStatus?.checked_in ? '✓' : '○'}
                    </div>
                    <div className="status-card-content">
                        <h3>Check-in</h3>
                        <p>{todayStatus?.check_in ? formatTime(todayStatus.check_in.recorded_at) : 'Belum'}</p>
                    </div>
                </div>

                <div className="card status-card">
                    <div className={`status-card-icon ${todayStatus?.checked_out ? 'success' : 'warning'}`}>
                        {todayStatus?.checked_out ? '✓' : '○'}
                    </div>
                    <div className="status-card-content">
                        <h3>Check-out</h3>
                        <p>{todayStatus?.check_out ? formatTime(todayStatus.check_out.recorded_at) : 'Belum'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-4">
                <div className="card-header">
                    <h2 className="card-title">Absensi</h2>
                </div>

                <div className="grid grid-2">
                    <Link
                        to="/attendance?type=check-in"
                        className={`btn attendance-btn ${todayStatus?.checked_in ? 'btn-outline' : 'btn-success'}`}
                        style={{ pointerEvents: todayStatus?.checked_in ? 'none' : 'auto', opacity: todayStatus?.checked_in ? 0.5 : 1 }}
                    >
                        <span className="attendance-btn-icon">📥</span>
                        Check-in
                        {todayStatus?.checked_in && <span style={{ fontSize: '0.8rem' }}>✓ Selesai</span>}
                    </Link>

                    <Link
                        to="/attendance?type=check-out"
                        className={`btn attendance-btn ${!todayStatus?.checked_in || todayStatus?.checked_out ? 'btn-outline' : 'btn-danger'}`}
                        style={{ pointerEvents: (!todayStatus?.checked_in || todayStatus?.checked_out) ? 'none' : 'auto', opacity: (!todayStatus?.checked_in || todayStatus?.checked_out) ? 0.5 : 1 }}
                    >
                        <span className="attendance-btn-icon">📤</span>
                        Check-out
                        {todayStatus?.checked_out && <span style={{ fontSize: '0.8rem' }}>✓ Selesai</span>}
                    </Link>
                </div>
            </div>

            {/* Detail Absensi Hari Ini */}
            {(todayStatus?.check_in || todayStatus?.check_out) && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h2 className="card-title">Detail Hari Ini</h2>
                    </div>

                    <div className="grid grid-2">
                        {todayStatus?.check_in && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <img
                                    src={todayStatus.check_in.photo_path}
                                    alt="Check-in"
                                    className="photo-thumb-lg"
                                />
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Check-in</div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {formatTime(todayStatus.check_in.recorded_at)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                                        {todayStatus.check_in.location_name || 'Lokasi tidak diketahui'}
                                    </div>
                                    <span className={`badge ${todayStatus.check_in.is_valid ? 'badge-success' : 'badge-warning'}`}>
                                        {todayStatus.check_in.is_valid ? 'Valid' : `${Math.round(todayStatus.check_in.distance_meters)}m dari kantor`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {todayStatus?.check_out && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <img
                                    src={todayStatus.check_out.photo_path}
                                    alt="Check-out"
                                    className="photo-thumb-lg"
                                />
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Check-out</div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {formatTime(todayStatus.check_out.recorded_at)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                                        {todayStatus.check_out.location_name || 'Lokasi tidak diketahui'}
                                    </div>
                                    <span className={`badge ${todayStatus.check_out.is_valid ? 'badge-success' : 'badge-warning'}`}>
                                        {todayStatus.check_out.is_valid ? 'Valid' : `${Math.round(todayStatus.check_out.distance_meters)}m dari kantor`}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Riwayat Terbaru */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Riwayat Terbaru</h2>
                    <Link to="/history" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Lihat Semua
                    </Link>
                </div>

                {history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p className="empty-state-text">Belum ada riwayat absensi</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Waktu</th>
                                    <th>Lokasi</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 5).map((record) => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.recorded_at).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <span className={`badge ${record.type === 'check_in' ? 'badge-primary' : 'badge-warning'}`}>
                                                {record.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                            </span>
                                        </td>
                                        <td>{formatTime(record.recorded_at)}</td>
                                        <td>{record.location_name || '-'}</td>
                                        <td>
                                            <span className={`badge ${record.is_valid ? 'badge-success' : 'badge-warning'}`}>
                                                {record.is_valid ? 'Valid' : 'Diluar Area'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
