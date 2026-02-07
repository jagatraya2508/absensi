-- Database Schema untuk Aplikasi Absensi Karyawan

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Attendance Locations (Lokasi Kantor)
CREATE TABLE IF NOT EXISTS attendance_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Attendance Records (Rekam Absensi)
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES attendance_locations(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('check_in', 'check_out')),
    photo_path VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    distance_meters DECIMAL(10, 2),
    is_valid BOOLEAN DEFAULT TRUE,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_recorded_at ON attendance_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_attendance_type ON attendance_records(type);

-- Tabel Leave Requests (Pengajuan Izin/Cuti)
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('late', 'sick', 'leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    attachment_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk leave_requests
CREATE INDEX IF NOT EXISTS idx_leave_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_date ON leave_requests(start_date);

-- Insert default admin user (password: admin123)
INSERT INTO users (employee_id, name, email, password, role) 
VALUES ('ADMIN001', 'Administrator', 'admin@company.com', '$2b$10$rQZ5QH2V5Y1vX8W6x9Y8/.O7kJ6H5F4G3D2C1B0A9N8M7L6K5J4I3', 'admin')
ON CONFLICT (employee_id) DO NOTHING;
