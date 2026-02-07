import { useState } from 'react';
import { authAPI } from '../utils/api';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Semua field harus diisi');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);

        try {
            const result = await authAPI.changePassword(currentPassword, newPassword);
            setSuccess(result.message || 'Password berhasil diubah');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">🔑 Ubah Password</h1>
                <p className="page-subtitle">Ganti password akun Anda</p>
            </div>

            <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
                {error && (
                    <div className="alert alert-danger mb-3">
                        <span className="alert-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success mb-3">
                        <span className="alert-icon">✓</span>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Password Lama</label>
                        <input
                            type="password"
                            className="form-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Masukkan password lama"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password Baru</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Menyimpan...
                            </>
                        ) : (
                            '🔑 Ubah Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
