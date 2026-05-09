from django.contrib.auth.models import AbstractUser
from django.db import models

# 1. Tabel Utama Pengguna (Pintu Gerbang)
class User(AbstractUser):
    # Kita definisikan pilihan role-nya
    ROLE_CHOICES = (
        ('ADMIN', 'Admin LPPIK'),
        ('KMF', 'Koordinator Mentoring Fakultas'),
        ('MENTOR', 'Mentor'),
        ('MENTEE', 'Mentee'),
    )
    
    # Tambahkan kolom role ke tabel User bawaan
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MENTEE')
    
    # Opsional: Jika ingin login pakai email, bukan username
    # email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

# 2. Tabel Profil Koordinator (KMF)
class Koordinator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='koordinator_profile')
    nama_lengkap = models.CharField(max_length=255)
    fakultas = models.CharField(max_length=100)

    def __str__(self):
        return self.nama_lengkap

# 3. Tabel Profil Mentor
class Mentor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    nama_lengkap = models.CharField(max_length=255)
    no_hp = models.CharField(max_length=15)

    def __str__(self):
        return self.nama_lengkap

# 4. Tabel Profil Mentee (Sesuai ERD kamu)
class Mentee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentee_profile')
    # halaqah = models.ForeignKey('Halaqah', on_delete=models.SET_NULL, null=True, blank=True) # Nanti diaktifkan kalau tabel Halaqah sudah ada
    nim = models.CharField(max_length=20, unique=True)
    nama_lengkap = models.CharField(max_length=255)
    prodi = models.CharField(max_length=100)

    def __str__(self):
        return self.nim + " - " + self.nama_lengkap
    
# 5. Tabel Halaqah (Kelompok Mentoring)
class Halaqah(models.Model):
    TINGKAT_CHOICES = (
        ('TAKHASUS', 'Takhasus'),
        ('TAHSIN', 'Tahsin'),
        ('TAHFIDZ', 'Tahfidz'),
    )
    nama_kelompok = models.CharField(max_length=100)
    tingkat = models.CharField(max_length=20, choices=TINGKAT_CHOICES)
    # Relasi ke Mentor (Satu mentor bisa pegang beberapa halaqah, tapi satu halaqah dipegang satu mentor)
    mentor = models.ForeignKey(Mentor, on_delete=models.SET_NULL, null=True, related_name='kelompok_halaqah')

    def __str__(self):
        return self.nama_kelompok

# PENTING: Karena tabel Halaqah sudah dibuat, kamu sekarang bisa menghapus 
# tanda pagar (#) pada baris 'halaqah' di dalam class Mentee yang kita buat sebelumnya.
# Contohnya jadi begini:
# halaqah = models.ForeignKey(Halaqah, on_delete=models.SET_NULL, null=True, blank=True, related_name='anggota_mentee')

# 6. Tabel Jadwal (Pertemuan Mingguan)
class Jadwal(models.Model):
    halaqah = models.ForeignKey(Halaqah, on_delete=models.CASCADE, related_name='jadwal_pertemuan')
    pertemuan_ke = models.IntegerField()
    tanggal = models.DateField()
    topik = models.CharField(max_length=255)
    kehadiran_mentor = models.BooleanField(default=True) 
    laporan_kegiatan = models.TextField(null=True, blank=True) # Jurnal/catatan dari mentor untuk koordinator

    def __str__(self):
        return f"Pertemuan {self.pertemuan_ke} - {self.halaqah.nama_kelompok}"

# 7. Tabel Presensi
class Presensi(models.Model):
    STATUS_CHOICES = (
        ('HADIR', 'Hadir'),
        ('IZIN', 'Izin'),
        ('SAKIT', 'Sakit'),
        ('ALPHA', 'Alpha'),
    )
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='presensi_mentee')
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='presensi_jadwal')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    waktu_input = models.DateTimeField(auto_now_add=True) # Otomatis mencatat waktu saat diinput

    def __str__(self):
        return f"{self.mentee.nama_lengkap} - {self.status}"

# 8. Tabel Resume
class Resume(models.Model):
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='resume_mentee')
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='resume_jadwal')
    file = models.FileField(upload_to='uploads/resume/', null=True, blank=True)
    nilai = models.IntegerField(null=True, blank=True) # Bisa kosong jika mentor belum menilai
    catatan_mentor = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Resume {self.mentee.nama_lengkap} - Pertemuan {self.jadwal.pertemuan_ke}"

# 9. Tabel Hafalan (Khusus tingkat Tahfidz)
class Hafalan(models.Model):
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='hafalan_mentee')
    nama_surah = models.CharField(max_length=100)
    ayat_awal = models.IntegerField()
    ayat_akhir = models.IntegerField()
    is_lulus = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.mentee.nama_lengkap} - {self.nama_surah}"
    
class Sertifikat(models.Model):
    # Relasi ke User (bisa untuk Mentor atau Mentee)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sertifikat_user')
    
    nomor_sertifikat = models.CharField(max_length=100, unique=True)
    sebagai = models.CharField(max_length=20, choices=[('MENTOR', 'Mentor'), ('MENTEE', 'Mentee')])
    
    # Gunakan URLField untuk menyimpan link Google Drive
    link_drive = models.URLField(max_length=500) 
    
    tanggal_terbit = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Sertifikat {self.sebagai} - {self.user.username}"