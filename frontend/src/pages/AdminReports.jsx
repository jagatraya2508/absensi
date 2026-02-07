import { useState, useEffect } from 'react';
import { reportsAPI } from '../utils/api';

export default function AdminReports() {
    const [reportType, setReportType] = useState('daily');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [reportType, date, year, month]);

    async function fetchReport() {
        setLoading(true);
        try {
            if (reportType === 'daily') {
                const data = await reportsAPI.getDaily(date);
                setReport(data);
            } else {
                const data = await reportsAPI.getMonthly(year, month);
                setReport(data);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleExportPDF() {
        setExporting(true);
        try {
            if (reportType === 'daily') {
                await reportsAPI.exportDailyPDF(date);
            } else {
                await reportsAPI.exportMonthlyPDF(year, month);
            }
        } catch (error) {
            console.error('Export PDF failed:', error);
            alert('Gagal mengunduh PDF');
        } finally {
            setExporting(false);
        }
    }

    async function handleExportExcel() {
        setExporting(true);
        try {
            if (reportType === 'daily') {
                await reportsAPI.exportDailyExcel(date);
            } else {
                await reportsAPI.exportMonthlyExcel(year, month);
            }
        } catch (error) {
            console.error('Export Excel failed:', error);
            alert('Gagal mengunduh Excel');
        } finally {
            setExporting(false);
        }
    }

    function formatTime(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📊 Laporan Absensi</h1>
                <p className="page-subtitle">Lihat rekapitulasi absensi karyawan</p>
            </div>

            {/* Filter */}
            <div className="card mb-4">
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Jenis Laporan</label>
                        <select
                            className="form-input form-select"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            style={{ minWidth: 150 }}
                        >
                            <option value="daily">Harian</option>
                            <option value="monthly">Bulanan</option>
                        </select>
                    </div>

                    {reportType === 'daily' ? (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Tanggal</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Bulan</label>
                                <select
                                    className="form-input form-select"
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    style={{ minWidth: 150 }}
                                >
                                    {months.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Tahun</label>
                                <select
                                    className="form-input form-select"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                >
                                    {[2024, 2025, 2026].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {report && reportType === 'daily' && (
                <div className="grid grid-4 mb-4">
                    <div className="card status-card">
                        <div className="status-card-icon primary">👥</div>
                        <div className="status-card-content">
                            <h3>Total Karyawan</h3>
                            <p>{report.summary.total_employees}</p>
                        </div>
                    </div>
                    <div className="card status-card">
                        <div className="status-card-icon success">✓</div>
                        <div className="status-card-content">
                            <h3>Hadir</h3>
                            <p>{report.summary.present}</p>
                        </div>
                    </div>
                    <div className="card status-card">
                        <div className="status-card-icon danger">✗</div>
                        <div className="status-card-content">
                            <h3>Tidak Hadir</h3>
                            <p>{report.summary.absent}</p>
                        </div>
                    </div>
                    <div className="card status-card">
                        <div className="status-card-icon warning">✓✓</div>
                        <div className="status-card-content">
                            <h3>Lengkap</h3>
                            <p>{report.summary.completed}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Table */}
            <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="card-title">
                        {reportType === 'daily'
                            ? `Laporan ${new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                            : `Laporan ${months[month - 1]} ${year}`
                        }
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={handleExportPDF}
                            disabled={exporting || !report || report.records?.length === 0}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            {exporting ? '⏳' : '📄'} PDF
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={handleExportExcel}
                            disabled={exporting || !report || report.records?.length === 0}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            {exporting ? '⏳' : '📊'} Excel
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    </div>
                ) : !report || report.records?.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <p className="empty-state-text">Tidak ada data untuk periode ini</p>
                    </div>
                ) : reportType === 'daily' ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Nama</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Lokasi</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.records.map((record) => (
                                    <tr key={record.user_id}>
                                        <td style={{ fontWeight: 500 }}>{record.employee_id}</td>
                                        <td>{record.name}</td>
                                        <td>
                                            {record.check_in_time ? (
                                                <div>
                                                    <span>{formatTime(record.check_in_time)}</span>
                                                    {!record.check_in_valid && (
                                                        <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                                                            ⚠
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {record.check_out_time ? (
                                                <div>
                                                    <span>{formatTime(record.check_out_time)}</span>
                                                    {!record.check_out_valid && (
                                                        <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                                                            ⚠
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>{record.location_name || '-'}</td>
                                        <td>
                                            {record.check_in_time && record.check_out_time ? (
                                                <span className="badge badge-success">Lengkap</span>
                                            ) : record.check_in_time ? (
                                                <span className="badge badge-warning">Belum Pulang</span>
                                            ) : (
                                                <span className="badge badge-danger">Tidak Hadir</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Nama</th>
                                    <th>Hadir</th>
                                    <th>Tidak Hadir</th>
                                    <th>Valid</th>
                                    <th>Diluar Area</th>
                                    <th>Persentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.records.map((record) => (
                                    <tr key={record.user_id}>
                                        <td style={{ fontWeight: 500 }}>{record.employee_id}</td>
                                        <td>{record.name}</td>
                                        <td>{record.total_present}</td>
                                        <td>{record.total_absent}</td>
                                        <td>{record.valid_checkins}</td>
                                        <td>{record.invalid_checkins}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: 60,
                                                    height: 6,
                                                    background: 'var(--gray-700)',
                                                    borderRadius: 3,
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${record.attendance_rate}%`,
                                                        height: '100%',
                                                        background: record.attendance_rate >= 80
                                                            ? 'var(--success-500)'
                                                            : record.attendance_rate >= 60
                                                                ? 'var(--warning-500)'
                                                                : 'var(--danger-500)'
                                                    }} />
                                                </div>
                                                <span>{record.attendance_rate}%</span>
                                            </div>
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
