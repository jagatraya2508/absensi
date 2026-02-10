import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function Login() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(employeeId, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login gagal. Periksa kembali Employee ID dan password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo">
                        <img src={settings.app_logo} alt="Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
                        <h1>Absensi Karyawan</h1>
                        <p>Silakan login untuk melanjutkan</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="employeeId">
                                Employee ID
                            </label>
                            <input
                                type="text"
                                id="employeeId"
                                className="form-input"
                                placeholder="Masukkan Employee ID"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                    Memproses...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                    © 2024 Absensi Karyawan. All rights reserved.
                </p>
            </div>
        </div>
    );
}
