# MINE-TORING Frontend

React + Vite dashboard untuk sistem manajemen mentoring AIK.

## Stack

- React 19 + Vite 8
- React Router DOM
- Axios (JWT interceptors)
- Tailwind CSS v4
- Framer Motion
- React Icons
- Zustand (auth state)
- Recharts
- React Hot Toast

## Menjalankan

```bash
npm install
npm run dev
```

Pastikan backend Django berjalan di `http://127.0.0.1:8000`.

## Login

Gunakan akun dari Django (`createsuperuser` atau data seed). Endpoint: `POST /api/login/`.

## Struktur

```
src/
├── api/          # Axios instance + interceptors
├── components/   # UI reusable
├── layouts/      # Auth & Dashboard layout
├── pages/        # Halaman per fitur
├── routes/       # Routing
├── store/        # Zustand auth
├── services/     # API calls
├── hooks/
└── utils/
```
