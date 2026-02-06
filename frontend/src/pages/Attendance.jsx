import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Camera from '../components/Camera';
import LocationTracker from '../components/LocationTracker';
import { attendanceAPI, locationsAPI } from '../utils/api';

export default function Attendance() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const type = searchParams.get('type') || 'check-in';
    const isCheckIn = type === 'check-in';

    const [step, setStep] = useState(1); // 1: Camera, 2: Confirm & Submit
    const [photo, setPhoto] = useState(null);
    const [photoBlob, setPhotoBlob] = useState(null);
    const [location, setLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchLocations();
    }, []);

    async function fetchLocations() {
        try {
            const data = await locationsAPI.getActive();
            setLocations(data);
            if (data.length > 0) {
                setSelectedLocation(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    }

    function handlePhotoCapture(blob, dataUrl) {
        setPhotoBlob(blob);
        setPhoto(dataUrl);
        setStep(2);
    }

    function handlePhotoReset() {
        setPhoto(null);
        setPhotoBlob(null);
        setStep(1);
    }

    function handleLocationUpdate(coords) {
        setLocation(coords);
    }

    async function handleSubmit() {
        if (!photoBlob || !location) {
            setError('Foto dan lokasi harus tersedia');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('photo', photoBlob, 'selfie.jpg');
            formData.append('latitude', location.latitude.toString());
            formData.append('longitude', location.longitude.toString());
            if (selectedLocation) {
                formData.append('location_id', selectedLocation.id.toString());
            }
            if (notes.trim()) {
                formData.append('notes', notes.trim());
            }

            const result = isCheckIn
                ? await attendanceAPI.checkIn(formData)
                : await attendanceAPI.checkOut(formData);

            setSuccess(result.message || `${isCheckIn ? 'Check-in' : 'Check-out'} berhasil!`);

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Gagal melakukan absensi');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">
                    {isCheckIn ? '📥 Check-in' : '📤 Check-out'}
                </h1>
                <p className="page-subtitle">
                    {isCheckIn ? 'Absen masuk kerja' : 'Absen pulang kerja'}
                </p>
            </div>

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

            {/* Progress Steps */}
            <div className="card mb-4" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: step >= 1 ? 'var(--gradient-primary)' : 'var(--gray-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600
                        }}>
                            1
                        </div>
                        <span style={{ color: step >= 1 ? 'white' : 'var(--gray-500)' }}>Foto Selfie</span>
                    </div>
                    <div style={{
                        width: 40,
                        height: 2,
                        background: step >= 2 ? 'var(--primary-500)' : 'var(--gray-700)',
                        alignSelf: 'center'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: step >= 2 ? 'var(--gradient-primary)' : 'var(--gray-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600
                        }}>
                            2
                        </div>
                        <span style={{ color: step >= 2 ? 'white' : 'var(--gray-500)' }}>Konfirmasi</span>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📸 Ambil Foto Selfie</h2>
                    </div>
                    <Camera onCapture={handlePhotoCapture} onReset={handlePhotoReset} />
                    <p className="text-muted text-center mt-2" style={{ fontSize: '0.85rem' }}>
                        Posisikan wajah Anda di dalam kotak
                    </p>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📸 Foto Selfie</h2>
                        </div>
                        {photo && (
                            <img src={photo} alt="Captured" style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
                        )}
                        <button
                            className="btn btn-outline btn-block mt-2"
                            onClick={handlePhotoReset}
                        >
                            🔄 Ambil Ulang
                        </button>
                    </div>

                    <div>
                        <div className="card mb-3">
                            <div className="card-header">
                                <h2 className="card-title">📍 Lokasi</h2>
                            </div>
                            <LocationTracker
                                onLocationUpdate={handleLocationUpdate}
                                targetLocation={selectedLocation}
                            />

                            {locations.length > 1 && (
                                <div className="form-group mt-3">
                                    <label className="form-label">Pilih Lokasi Kantor</label>
                                    <select
                                        className="form-input form-select"
                                        value={selectedLocation?.id || ''}
                                        onChange={(e) => {
                                            const loc = locations.find(l => l.id === parseInt(e.target.value));
                                            setSelectedLocation(loc);
                                        }}
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="card mb-3">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Catatan (Opsional)</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Tambahkan catatan jika diperlukan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            className={`btn ${isCheckIn ? 'btn-success' : 'btn-danger'} btn-block btn-lg`}
                            onClick={handleSubmit}
                            disabled={loading || !photo || !location}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    {isCheckIn ? '📥 Konfirmasi Check-in' : '📤 Konfirmasi Check-out'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
