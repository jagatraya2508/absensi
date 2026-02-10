import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { attendanceAPI, announcementsAPI } from '../utils/api';
import ImageModal from '../components/ImageModal';

export default function Dashboard() {
    const { user } = useAuth();
    const { settings } = useSettings();
    const [todayStatus, setTodayStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Image Modal State
    const [selectedImg, setSelectedImg] = useState({ src: '', caption: '', isOpen: false });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [statusData, historyData, announcementsData] = await Promise.all([
                attendanceAPI.getToday(),
                attendanceAPI.getHistory({ limit: 10 }),
                announcementsAPI.getActive()
            ]);
            setTodayStatus(statusData);
            setHistory(historyData);
            setAnnouncements(announcementsData);
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
            {/* Background Watermark */}
            <img
                src={settings.app_logo}
                alt=""
                className="dashboard-watermark"
                onError={(e) => e.target.style.display = 'none'}
            />

            <div className="page-header">
                <h1 className="page-title">Selamat Datang, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="page-subtitle">{today}</p>
            </div>


            {/* Announcements Section (Top) */}
            {announcements.length > 0 && (
                <div className="mb-4">
                    {announcements.map(item => (
                        <div key={item.id} className="card-glass mb-3" style={{
                            background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                            borderLeft: '4px solid var(--primary-500)',
                            padding: '1rem 1.5rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '5rem', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                📢
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div style={{
                                    background: 'var(--primary-500)',
                                    color: 'white',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem'
                                }}>
                                    📢
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                        {item.title}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-300)' }}>
                                        {formatDate(item.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '3.25rem' }}>
                                <p style={{ margin: 0, whiteSpace: 'pre-line', color: 'var(--gray-200)', lineHeight: '1.6' }}>
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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


            {/* Quick Actions & Menus (Talenta Style) */}
            <div className="mb-4">
                {/* Attendance Buttons - Compact & Side by Side */}
                <div className="attendance-action-grid gap-3 mb-4">
                    <Link
                        to="/attendance?type=check-in"
                        className={`btn-attendance-compact ${todayStatus?.checked_in ? 'disabled' : 'primary'}`}
                        style={{ pointerEvents: todayStatus?.checked_in ? 'none' : 'auto' }}
                    >
                        <div className="icon-wrapper">
                            <span className="icon">📥</span>
                        </div>
                        <div className="text-wrapper">
                            <span className="label">Check-in</span>
                            <span className="sub-label">{todayStatus?.checked_in ? 'Sudah Absen' : 'Masuk Kerja'}</span>
                        </div>
                        {todayStatus?.checked_in && <div className="status-badge">✓</div>}
                    </Link>

                    <Link
                        to="/attendance?type=check-out"
                        className={`btn-attendance-compact ${(!todayStatus?.checked_in || todayStatus?.checked_out) ? 'disabled' : 'danger'}`}
                        style={{ pointerEvents: (!todayStatus?.checked_in || todayStatus?.checked_out) ? 'none' : 'auto' }}
                    >
                        <div className="icon-wrapper">
                            <span className="icon">📤</span>
                        </div>
                        <div className="text-wrapper">
                            <span className="label">Check-out</span>
                            <span className="sub-label">{todayStatus?.checked_out ? 'Sudah Absen' : 'Pulang Kerja'}</span>
                        </div>
                        {todayStatus?.checked_out && <div className="status-badge">✓</div>}
                    </Link>
                </div>

                {/* User Menus Grid */}
                <div className="menu-grid">
                    <Link to="/history" className="menu-item">
                        <div className="menu-icon bg-blue-100 text-blue-600">📋</div>
                        <span className="menu-label">Riwayat</span>
                    </Link>
                    <Link to="/leaves" className="menu-item">
                        <div className="menu-icon bg-green-100 text-green-600">📝</div>
                        <span className="menu-label">Izin & Cuti</span>
                    </Link>
                    <Link to="/change-password" className="menu-item">
                        <div className="menu-icon bg-purple-100 text-purple-600">🔑</div>
                        <span className="menu-label">Ubah Password</span>
                    </Link>
                    {user?.role === 'admin' && (
                        <>
                            <Link to="/admin/announcements" className="menu-item">
                                <div className="menu-icon bg-yellow-100 text-yellow-600">📢</div>
                                <span className="menu-label">Pengumuman</span>
                            </Link>
                            <Link to="/admin/locations" className="menu-item">
                                <div className="menu-icon bg-red-100 text-red-600">📍</div>
                                <span className="menu-label">Kelola Lokasi</span>
                            </Link>
                            <Link to="/admin/users" className="menu-item">
                                <div className="menu-icon bg-pink-100 text-pink-600">👥</div>
                                <span className="menu-label">Kelola User</span>
                            </Link>
                            <Link to="/admin/leaves" className="menu-item">
                                <div className="menu-icon bg-teal-100 text-teal-600">📝</div>
                                <span className="menu-label">Kelola Izin</span>
                            </Link>
                            <Link to="/admin/reports" className="menu-item">
                                <div className="menu-icon bg-orange-100 text-orange-600">📊</div>
                                <span className="menu-label">Laporan</span>
                            </Link>
                            <Link to="/admin/face-registration" className="menu-item">
                                <div className="menu-icon bg-indigo-100 text-indigo-600">🔐</div>
                                <span className="menu-label">Registrasi Wajah</span>
                            </Link>
                        </>
                    )}
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
                                    onClick={() => setSelectedImg({
                                        src: todayStatus.check_in.photo_path,
                                        caption: `Check-in - ${formatDate(todayStatus.check_in.recorded_at)} ${formatTime(todayStatus.check_in.recorded_at)}`,
                                        isOpen: true
                                    })}
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
                                    onClick={() => setSelectedImg({
                                        src: todayStatus.check_out.photo_path,
                                        caption: `Check-out - ${formatDate(todayStatus.check_out.recorded_at)} ${formatTime(todayStatus.check_out.recorded_at)}`,
                                        isOpen: true
                                    })}
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

            <ImageModal
                isOpen={selectedImg.isOpen}
                onClose={() => setSelectedImg({ ...selectedImg, isOpen: false })}
                imgSrc={selectedImg.src}
                caption={selectedImg.caption}
            />


        </div>
    );
}
