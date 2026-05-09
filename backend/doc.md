
# tutor buka: 
1. git fetch
    git checkout backend
    git pull origin backend
2. buat venv: python -m venv venv
    trus venv\Scripts\activate
3. pip install -r requirements.txt
4. python manage.py migrate
5. bikin akun admin sendiri: python manage.py     createsuperuser
6. python manage.py runserver

# http://127.0.0.1:8000/admin

# list yg sudah dikerjakan:
# 🗄️ 1. Pemodelan Database (Django ORM)
Melakukan reset database untuk membersihkan riwayat migrasi yang bentrok.

Membangun skema relasional tabel tingkat lanjut (User, Koordinator, Mentor, Mentee, Halaqah, Jadwal, Presensi, Resume, Hafalan).

Mengimplementasikan strategi efisiensi penyimpanan (External Storage Reference) untuk tabel Sertifikat menggunakan URL Google Drive.

Mendaftarkan seluruh model ke halaman Django Admin untuk kemudahan manajemen data manual.

# ⚙️ 2. Pembangunan REST API (Decoupled Architecture)
Membuat Serializers untuk menerjemahkan objek Python/ORM menjadi format JSON.

Membuat ViewSets untuk menangani operasi CRUD (Create, Read, Update, Delete) secara otomatis.

Mengonfigurasi sistem routing (URLs) sebagai endpoint yang siap "ditembak" oleh aplikasi React.

# 🛡️ 3. Implementasi Keamanan & Hak Akses (Security)
Memasang dan mengonfigurasi autentikasi standar industri menggunakan JSON Web Token (JWT).

Mengatur CORS (Cross-Origin Resource Sharing) agar frontend lokal diizinkan mengambil data dari server Django.

Membuat Custom Permissions (IsAdminOrReadOnly, IsMentorCanEditMenteeReadOnly) untuk membatasi aksi User berdasarkan Role (Admin/Mentor/Mentee).

Mengamankan kerahasiaan data pribadi dengan melakukan Override Queryset (Mentee hanya bisa melihat data absen/nilai/sertifikat miliknya sendiri).

# 🧪 4. Quality Assurance & API Testing
Menguji penolakan akses untuk tamu tak diundang (HTTP 401 Unauthorized).

Menguji siklus Login untuk melakukan generate Token JWT (Access & Refresh Token).

Melakukan pengujian integrasi endpoint menggunakan Thunder Client dengan menyisipkan Bearer Token di dalam HTTP Headers (HTTP 200 OK).

Melakukan troubleshooting dan debugging rute URL (HTTP 404 Not Found menjadi sukses).



# FRONTENDDDD
1. Inisialisasi Proyek & Slicing UI
Langkah pertama murni pekerjaan visual dan pengaturan awal.

Setup Project: bisa mulai membuat kerangka project React, misalnya menggunakan Vite agar proses development-nya lebih cepat.

Slicing Design: Mengubah desain mockup atau prototype yang mungkin sudah kalian buat (seperti di Figma/Canva) menjadi komponen-komponen React sesungguhnya (halaman Login, Dashboard, Form Absen, dll).

2. Mengatur Alat Komunikasi (API Client)
Agar React bisa "ngobrol" dengan Django, butuh alat pengirim surat.

Install Axios: Sangat disarankan meng-install library bernama axios karena lebih mudah dipakai dibanding fetch bawaan browser.

Setup Base URL: Membuat satu file konfigurasi khusus (misal api.js) yang mencatat alamat server : http://127.0.0.1:8000. Jadi tidak perlu mengetik ulang URL panjang di setiap halaman.

3. Membangun Sistem Login & Penyimpanan Token (Krusial! 🔥)
Ini biasanya tantangan terbesar di frontend. yaitu harus membuat alur autentikasi:

Mengirim username & password dari form login ke POST /api/login/.

Menangkap Token: Saat Django membalas dengan teks token panjang (Access & Refresh), React harus menyimpannya dengan aman (biasanya di localStorage atau sessionStorage browser).

Menempelkan Token: harus mengatur agar setiap kali React pindah halaman atau meminta data lain (seperti daftar Halaqah), token JWT tersebut otomatis diselipkan di bagian Headers (Authorization: Bearer ).

4. Menarik & Mengirim Data (Integrasi Endpoint)
Setelah kunci JWT terpasang,  tinggal menghubungkan komponen UI dengan sisa URL API di dokumentasi yang kamu berikan:

GET Data: Menampilkan nama-nama Mentee, jadwal pertemuan, atau riwayat absen ke dalam bentuk tabel di layar.

POST/PUT Data: Membuat form untuk Mentor agar bisa mencentang siapa saja yang hadir, lalu mengirim data tersebut ke POST /api/presensi/.

5. Menangani Error (UX Handling)
Terkadang akan ada kesalahan di jalan, dan frontend harus menampilkan pesan yang ramah pengguna.

Jika server membalas 401 Unauthorized (token kedaluwarsa), arahkan user kembali ke halaman Login secara otomatis.

Jika server membalas 403 Forbidden (Mentee mencoba menghapus jadwal), munculkan pop-up peringatan merah: "Maaf, Anda tidak memiliki akses untuk tindakan ini."