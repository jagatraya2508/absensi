# Aplikasi Absensi Karyawan

Aplikasi absensi karyawan dengan fitur foto selfie dan GPS tracking.

## Fitur

- ✅ Login dengan Employee ID dan password
- ✅ Check-in dan Check-out dengan foto selfie
- ✅ GPS tracking untuk validasi lokasi
- ✅ Setting radius lokasi kantor
- ✅ Laporan absensi harian dan bulanan
- ✅ Manajemen user (Admin)
- ✅ Manajemen lokasi (Admin)

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite
- **Authentication**: JWT

## Cara Menjalankan

### 1. Setup Database

Buat database PostgreSQL dengan nama `absensi`:

```sql
CREATE DATABASE absensi;
```

### 2. Backend

```bash
cd backend
npm install
node server.js
```

Server running di http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi running di http://localhost:3000

## Login Default

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | ADMIN001 | admin123 |

## Struktur Folder

```
├── backend/
│   ├── db/           # Database connection & schema
│   ├── middleware/   # JWT authentication
│   ├── routes/       # API endpoints
│   ├── utils/        # Helper functions
│   └── uploads/      # Uploaded photos
│
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── context/     # React context
        ├── pages/       # Page components
        └── utils/       # API utilities
```
