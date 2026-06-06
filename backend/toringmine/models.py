from django.contrib.auth.models import AbstractUser, UserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


# ==========================================
# 1. MANAJEMEN USER & PROFIL
# ==========================================

class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'KMF')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('role') != 'KMF':
            extra_fields['role'] = 'KMF'

        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('LPPIK', 'Admin LPPIK'),
        ('KMF', 'Koordinator Mentoring Fakultas'),
        ('MENTOR', 'Mentor'),
        ('MENTEE', 'Mentee'),
    )

    objects = CustomUserManager()

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MENTEE')
    nim = models.CharField(max_length=20, unique=True, null=True, blank=True) 
    foto = models.ImageField(upload_to='uploads/profile/', null=True, blank=True)
    no_hp = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Koordinator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='koordinator_profile')
    nama_lengkap = models.CharField(max_length=255)
    fakultas = models.CharField(max_length=100)

    def __str__(self):
        return self.nama_lengkap


class Mentor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    nama_lengkap = models.CharField(max_length=255)
    no_hp = models.CharField(max_length=15, blank=True, default='')

    def __str__(self):
        return self.nama_lengkap


class Halaqah(models.Model):
    TINGKAT_CHOICES = (
        ('TAKHASUS', 'Takhasus'),
        ('TAHSIN', 'Tahsin'),
        ('TAHFIDZ', 'Tahfidz'),
    )
    nama_kelompok = models.CharField(max_length=100)
    tingkat = models.CharField(max_length=20, choices=TINGKAT_CHOICES)
    mentor = models.ForeignKey(
        Mentor, on_delete=models.SET_NULL, null=True, blank=True, related_name='kelompok_halaqah'
    )
    semester_aktif = models.CharField(max_length=50, default='2025-Ganjil')

    def __str__(self):
        return self.nama_kelompok


class Mentee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentee_profile')
    halaqah = models.ForeignKey(
        Halaqah, on_delete=models.SET_NULL, null=True, blank=True, related_name='anggota_mentee'
    )
    nim = models.CharField(max_length=20, unique=True)
    nama_lengkap = models.CharField(max_length=255)
    prodi = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nim} - {self.nama_lengkap}"


# ==========================================
# 2. JADWAL & MATERI (GLOBAL OLEH KMF)
# ==========================================




# ==========================================
# 2. JADWAL & MATERI (GLOBAL OLEH KMF)
# ==========================================

class Jadwal(models.Model):
    MAX_PERTEMUAN = 12
    semester = models.CharField(max_length=50, default='2025-Ganjil')
    pertemuan_ke = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    tanggal = models.DateField(null=True, blank=True)
    
    # HAPUS topik, deskripsi, dan ManyToManyField dari sini.
    # Biarkan Jadwal murni mengurus "Waktu Pertemuan" saja.

    class Meta:
        unique_together = ('semester', 'pertemuan_ke')
        ordering = ['semester', 'pertemuan_ke']

    def __str__(self):
        return f"Pertemuan {self.pertemuan_ke} ({self.semester})"


class MateriMentoring(models.Model):
    # Ubah related_name menjadi 'materi' agar pas ditarik oleh Frontend, namanya langsung cocok
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='materi')
    
    # Sesuaikan dengan nama variabel di Frontend
    topik = models.CharField(max_length=255)
    deskripsi = models.TextField(blank=True, default='')
    
    file = models.FileField(upload_to='uploads/materi/', null=True, blank=True)
    url = models.URLField(max_length=500, null=True, blank=True) # Ubah dari link_url ke url

    def __str__(self):
        return f"{self.topik} - {self.jadwal}"



class InformasiKegiatan(models.Model):
    KATEGORI_CHOICES = (
        ('MENTORING', 'Info Mentoring'),
        ('CINTA_SUBUH', 'Cinta Subuh'),
        ('TABLIGH_AKBAR', 'Tabligh Akbar'),
        ('LAINNYA', 'Lainnya'),
    )
    judul = models.CharField(max_length=255)
    kategori = models.CharField(max_length=20, choices=KATEGORI_CHOICES, default='MENTORING')
    
    # Ubah 'deskripsi' menjadi 'isi' agar cocok dengan frontend InformasiForm.jsx
    isi = models.TextField() 
    
    tanggal_kegiatan = models.DateField(null=True, blank=True)
    poster = models.ImageField(upload_to='uploads/informasi/', null=True, blank=True)
    dibuat_pada = models.DateTimeField(auto_now_add=True)
    pembuat = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='informasi_dibuat')

    class Meta:
        ordering = ['-dibuat_pada']

    def __str__(self):
        return f"[{self.get_kategori_display()}] {self.judul}"


# ==========================================
# 3. PRESENSI & JURNAL PER HALAQAH
# ==========================================

class JurnalPertemuan(models.Model):
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='jurnal_pertemuan')
    halaqah = models.ForeignKey(Halaqah, on_delete=models.CASCADE, related_name='jurnal_pertemuan')
    tanggal_pelaksanaan = models.DateField(auto_now_add=True)
    
    # Presensi Mentor (KMF yang mengontrol/memantau ini)
    mentor_hadir = models.BooleanField(default=True)
    laporan_kegiatan = models.TextField(blank=True, null=True)
    
    # Menandakan siapa yang mengisi absen Mentee (Bisa Mentor asli, atau KMF sbg backup)
    diisi_oleh = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='jurnal_diisi')

    class Meta:
        unique_together = ('jadwal', 'halaqah')

    def __str__(self):
        return f"Jurnal {self.halaqah.nama_kelompok} - Pertemuan {self.jadwal.pertemuan_ke}"


class Presensi(models.Model):
    STATUS_CHOICES = (
        ('HADIR', 'Hadir'),
        ('IZIN', 'Izin'),
        ('SAKIT', 'Sakit'),
        ('ALPHA', 'Alpha'),
    )
    
    # 1. SIAPA YANG ABSEN? (Bisa Mentee, bisa Mentor, jadi dua-duanya boleh kosong/null)
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, null=True, blank=True)
    mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE, null=True, blank=True) # 👈 TAMBAHAN BARU
    
    # 2. ABSEN DI PERTEMUAN MANA?
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, null=True, blank=True) # 👈 TAMBAHAN BARU
    jurnal = models.ForeignKey(JurnalPertemuan, on_delete=models.CASCADE, null=True, blank=True) # 👈 FIX ERROR FATAL
    
    # 3. DETAIL ABSENSI
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ALPHA')
    catatan = models.TextField(null=True, blank=True) # 👈 TAMBAHAN BARU (Karena frontend kirim 'catatan')
    surat_izin = models.FileField(upload_to='uploads/surat_izin/', null=True, blank=True)
    waktu_input = models.DateTimeField(auto_now=True)

    # (Opsional) Aku matikan dulu unique_together biar kamu nggak kena error saat migrasi.
    # Nanti kalau aplikasinya sudah stabil, bisa diaktifkan lagi.
    # class Meta:
    #     unique_together = ('mentee', 'jurnal')

    def __str__(self):
        # Biar nama di admin panel dinamis (nampilin nama mentor atau mentee)
        nama = self.mentor.nama_lengkap if self.mentor else (self.mentee.nama_lengkap if self.mentee else "Unknown")
        return f"{nama} - {self.status}"

# ==========================================
# 4. PENILAIAN & MUTABAAH
# ==========================================

class Resume(models.Model):
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='resume_mentee')
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='resume_jadwal')
    file = models.FileField(upload_to='uploads/resume/', null=True, blank=True)
    nilai = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    catatan_mentor = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('mentee', 'jadwal')

    def __str__(self):
        return f"Resume {self.mentee.nama_lengkap} - Pertemuan {self.jadwal.pertemuan_ke}"


class Mutabaah(models.Model):
    # Menggantikan model Hafalan agar fleksibel untuk Takhasus, Tahsin, dan Tahfidz
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='mutabaah_mentee')
    tanggal = models.DateField(default=timezone.now)
    pertemuan_ke = models.IntegerField(null=True, blank=True) # Bisa diisi "Al-Baqarah" (untuk Tahfidz/Tahsin) atau "Iqro Jilid 4" (untuk Takhasus)
    materi_bacaan = models.CharField(max_length=150, help_text="Contoh: Al-Baqarah / Iqro Jilid 4")
    
    # Bisa diisi "Ayat 1-10" atau "Halaman 15"
    rentang_bacaan = models.CharField(max_length=100, help_text="Contoh: Ayat 1-10 / Halaman 15")
    
    catatan_mentor = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Mutabaah {self.mentee.nama_lengkap} - {self.materi_bacaan}"





class Sertifikat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sertifikat_ku')
    sebagai = models.CharField(max_length=20, choices=[('MENTEE', 'Mentee'), ('MENTOR', 'Mentor')])
    
    link_sertifikat = models.URLField(max_length=1000,null=True, blank=True) 
    tanggal_terbit = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Sertifikat {self.user.username} - {self.sebagai}"
    

@receiver(post_save, sender=User)
def sync_user_profile_from_frontend(sender, instance, created, **kwargs):
    # Abaikan superuser untuk mencegah efek samping saat membuat/masuk akun admin
    if instance.is_superuser:
        return

    if instance.role == 'MENTEE':
        # Hanya buat atau perbarui profil Mentee bila NIM tersedia
        if not instance.nim:
            return

        mentee, created_profile = Mentee.objects.get_or_create(
            user=instance,
            defaults={
                'prodi': '-',
                'nim': instance.nim,
                'nama_lengkap': instance.first_name or instance.username,
            }
        )

        mentee.nim = instance.nim
        mentee.nama_lengkap = instance.first_name or instance.username
        if not mentee.prodi:
            mentee.prodi = '-'
        mentee.save()

    elif instance.role == 'MENTOR':
        mentor, created_profile = Mentor.objects.get_or_create(user=instance)
        mentor.nama_lengkap = instance.first_name or instance.username
        mentor.save()

class NilaiUjian(models.Model):
    mentee = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nilai_ujian')
    # halaqah = models.ForeignKey(Halaqah, on_delete=models.CASCADE) # Opsional jika butuh filter per halaqah
    
    # 5 Aspek Penilaian (Maks 20 per aspek)
    aspek_1 = models.IntegerField(default=0)
    aspek_2 = models.IntegerField(default=0)
    aspek_3 = models.IntegerField(default=0)
    aspek_4 = models.IntegerField(default=0)
    aspek_5 = models.IntegerField(default=0)
    
    # Kolom otomatis (jangan diisi manual)
    total_nilai = models.IntegerField(default=0, editable=False)
    status_lulus = models.BooleanField(default=False, editable=False)
    
    # Audit Trail: Siapa yang ngisi nilai ini? (Bisa KMF atau Mentor)
    dinilai_oleh = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='penilai')

    def save(self, *args, **kwargs):
        # 1. Kalkulasi otomatis total nilai
        self.total_nilai = self.aspek_1 + self.aspek_2 + self.aspek_3 + self.aspek_4 + self.aspek_5
        
        # 2. Validasi KKM (70)
        self.status_lulus = self.total_nilai >= 70
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Nilai {self.mentee.username} - Total: {self.total_nilai}"