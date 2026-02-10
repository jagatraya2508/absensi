import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function AdminSettings() {
    const { settings, updateLogo } = useSettings();
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(settings.app_logo);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'danger', text: 'Ukuran file maksimal 2MB' });
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setMessage({ type: '', text: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!logoFile) {
            setMessage({ type: 'danger', text: 'Silakan pilih file logo terlebih dahulu' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
            await updateLogo(formData);
            setMessage({ type: 'success', text: 'Logo berhasil diperbarui' });
            setLogoFile(null);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Gagal memperbarui logo' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚙️ Pengaturan Aplikasi</h1>
                <p className="page-subtitle">Kelola konfigurasi sistem dan tampilan</p>
            </div>

            <div style={{ maxWidth: '600px' }}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Ganti Logo Aplikasi</h2>
                    </div>

                    <div style={{ padding: '1.5rem 0' }}>
                        {message.text && (
                            <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
                                <span className="alert-icon">{message.type === 'success' ? '✅' : '⚠️'}</span>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '0.75rem' }}>
                                    Preview Logo Saat Ini:
                                </p>
                                <div style={{
                                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                                    borderRadius: '1rem',
                                    padding: '2.5rem',
                                    display: 'inline-block',
                                    background: 'rgba(255, 255, 255, 0.03)'
                                }}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview Logo"
                                        style={{ maxHeight: '120px', width: 'auto', borderRadius: '0.5rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="logo">
                                    Pilih File Logo Baru (PNG, JPG, SVG)
                                </label>
                                <input
                                    type="file"
                                    id="logo"
                                    className="form-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                                    Ukuran file maksimal: 2MB. Disarankan aspek rasio 1:1 atau horizontal.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                disabled={loading || !logoFile}
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    'Simpan Perubahan Logo'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
