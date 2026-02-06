import { useRef, useState, useCallback, useEffect } from 'react';

export default function Camera({ onCapture, onReset }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera

    const startCamera = useCallback(async () => {
        try {
            setError(null);

            // Stop existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Izin kamera ditolak. Mohon izinkan akses kamera di browser.');
            } else if (err.name === 'NotFoundError') {
                setError('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.');
            } else {
                setError('Gagal mengakses kamera: ' + err.message);
            }
        }
    }, [facingMode, stream]);

    useEffect(() => {
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');

        // Mirror the image for front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);

        // Convert to blob for upload
        canvas.toBlob((blob) => {
            if (onCapture) {
                onCapture(blob, dataUrl);
            }
        }, 'image/jpeg', 0.8);

        // Stop camera after capture
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [stream, onCapture]);

    const retakePhoto = useCallback(() => {
        setPhoto(null);
        if (onReset) onReset();
        startCamera();
    }, [onReset, startCamera]);

    const switchCamera = useCallback(() => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        startCamera();
    }, [startCamera]);

    if (error) {
        return (
            <div className="camera-container">
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                    <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={startCamera}>
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="camera-container">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!photo ? (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-video"
                    />
                    <div className="camera-overlay" />

                    <div className="camera-controls">
                        <button
                            className="btn btn-outline"
                            onClick={switchCamera}
                            title="Ganti Kamera"
                        >
                            🔄
                        </button>
                        <button className="camera-btn" onClick={capturePhoto}>
                            <div className="camera-btn-inner" />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <img src={photo} alt="Captured" className="camera-preview" />
                    <div className="camera-controls">
                        <button
                            className="btn btn-outline"
                            onClick={retakePhoto}
                        >
                            🔄 Ambil Ulang
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
