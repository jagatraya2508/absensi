import OffDayManager from '../components/OffDayManager';

export default function OffDays() {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <h1 className="page-title">Atur Libur</h1>
                <p className="page-subtitle">Kelola jadwal libur pribadi Anda (off day)</p>
            </div>

            <div style={{ flex: 1 }}>
                <OffDayManager isPage={true} />
            </div>
        </div>
    );
}
