# MINE-TORING

Sistem manajemen mentoring berbasis Django REST API untuk backend dan React + Vite untuk frontend.

## Deskripsi

Aplikasi ini dirancang untuk mengelola kegiatan mentoring, termasuk autentikasi JWT, manajemen pengguna dengan role, jadwal halaqah, presensi, resume, mutabaah, sertifikat, dan backend admin Django.

## Arsitektur

- `backend/` : Django project dan aplikasi `toringmine`
  - `manage.py` : perintah manajemen Django
  - `minetoring/settings.py` : konfigurasi database SQLite, auth, REST framework, JWT, CORS, media
  - `toringmine/` : models, serializers, views, permissions, URLs, management commands, tests, migrations
- `frontend/react/` : React app dengan Vite
  - `src/api/axios.js` : konfigurasi axios dan interceptors
  - `src/services/` : panggilan API untuk fitur aplikasi
  - `src/pages/` : halaman aplikasi untuk setiap modul
  - `src/store/` : Zustand untuk penyimpanan auth state
  - `src/utils/constants.js` : base URL API dan konstanta aplikasi

## Backend

### Teknologi

- Python 3
- Django 6.0.4
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- SQLite
- Pillow
- import_export

### Setup

Buka terminal di folder `backend/` lalu jalankan:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### URL penting

- Admin Django: `http://127.0.0.1:8000/admin`
- API base: `http://127.0.0.1:8000/api/`
- Auth endpoint: `POST /api/login/`
- JWT refresh: `POST /api/token/refresh/`

### API Endpoints

#### Auth
- `POST /api/login/`
  - Body: `{ "username": "...", "password": "..." }`
  - Response: `access`, `refresh`
- `POST /api/token/refresh/`
  - Body: `{ "refresh": "..." }`
  - Response: `access`

#### User
- `GET /api/users/` - list semua user (autentikasi)
- `GET /api/users/{id}/` - detail user
- `GET /api/users/me/` - profile authenticated user
- `PATCH /api/users/me/` - update profile authenticated user

#### Data Master & Fitur
- `GET/POST/PUT/PATCH/DELETE /api/mentors/`
- `GET/POST/PUT/PATCH/DELETE /api/mentees/`
- `GET/POST/PUT/PATCH/DELETE /api/halaqah/`
- `GET/POST/PUT/PATCH/DELETE /api/jadwal/`
- `GET/POST/PUT/PATCH/DELETE /api/jurnal/`
- `GET/POST/PUT/PATCH/DELETE /api/presensi/`
- `GET/POST/PUT/PATCH/DELETE /api/resumes/`
- `GET/POST/PUT/PATCH/DELETE /api/mutabaahs/`
- `GET/POST/PUT/PATCH/DELETE /api/informasi/`
- `GET/POST/PUT/PATCH/DELETE /api/sertifikat/`
- `GET/POST/PUT/PATCH/DELETE /api/nilai-ujian/`

#### Endpoint khusus
- `POST /api/kmf/tambah-user/` - tambah user manual oleh KMF
- `GET /api/dashboard/kmf-summary/` - ringkasan dashboard KMF/Admin
- `POST /api/sertifikat/add_user_sertifikat/` - tambah sertifikat oleh admin

### Permission dan Role

- `LPPIK` (Admin) dan `KMF` dapat melihat data global
- `MENTOR` dapat mengakses data yang berkaitan dengan halaqah dan mentee sendiri
- `MENTEE` hanya dapat melihat data dirinya sendiri untuk `mentees`, `presensi`, `mutabaahs`, `resumes`, `sertifikat`, dan `nilai-ujian`
- `users/me/` tersedia untuk semua pengguna yang sudah login

### Catatan

- Backend menggunakan `AUTH_USER_MODEL = 'toringmine.User'`
- Media files disimpan di `backend/media/`
- CORS diizinkan untuk `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, dan `http://127.0.0.1:3000`
- Token access berlaku 8 jam, refresh 7 hari

## Frontend

### Teknologi

- React 19
- Vite 8
- Tailwind CSS 4
- Axios
- Zustand
- React Router DOM
- Framer Motion
- React Hot Toast
- Recharts

### Setup

Buka terminal di folder `frontend/react/` lalu jalankan:

```bash
npm install
npm run dev
```

Frontend default akan berjalan pada `http://localhost:5173` dan terhubung ke backend di `http://127.0.0.1:8000`.

### Konfigurasi API

Base URL backend didefinisikan di `frontend/react/src/utils/constants.js`:

```js
export const API_BASE_URL = 'http://127.0.0.1:8000'
```

### Auth dan Role

- Token disimpan di `localStorage`
- Role pengguna tersedia di `src/utils/constants.js`
- Contoh role:
  - `LPPIK` : Admin
  - `KMF` : Koordinator Mentoring Fakultas
  - `MENTOR` : Mentor
  - `MENTEE` : Mentee

## Fitur Utama

- Login JWT dan manajemen sesi pengguna
- CRUD data mentor, mentee, halaqah, jadwal, presensi, mutabaah, dan sertifikat
- Hak akses berbasis peran
- Admin Django untuk manajemen data cepat
- Frontend dashboard dengan visualisasi dan tabel data

## Dokumentasi Tambahan

Folder backend sudah memiliki dokumentasi setup tambahan di `backend/doc.md`.

## Cara Menggunakan

1. Jalankan backend Django di `backend/`
2. Jalankan frontend React di `frontend/react/`
3. Login menggunakan akun Django yang sudah dibuat
4. Akses dashboard frontend dan gunakan API sesuai role

## Struktur Folder Singkat

```
backend/
  manage.py
  requirements.txt
  minetoring/
    settings.py
    urls.py
  toringmine/
    models.py
    views.py
    serializers.py
    permissions.py
    urls.py
frontend/react/
  package.json
  src/
    api/
    components/
    layouts/
    pages/
    services/
    store/
    utils/
```

## Pengembangan

- Untuk menambah endpoint API, tambahkan serializer, viewset, dan route di `backend/toringmine/`
- Untuk menambah halaman frontend, buat page baru di `frontend/react/src/pages/` dan tambahkan route di `frontend/react/src/routes/AppRoutes.jsx`
- Untuk perubahan global API, update `frontend/react/src/utils/constants.js`

## Lisensi

Dokumentasi ini tidak menyertakan lisensi khusus. Sesuaikan dengan kebijakan tim atau organisasi.
