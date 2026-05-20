from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin LPPIK'),
        ('KMF', 'Koordinator Mentoring Fakultas'),
        ('MENTOR', 'Mentor'),
        ('MENTEE', 'Mentee'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MENTEE')
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
        Mentor, on_delete=models.SET_NULL, null=True, blank=True, related_name='kelompok_halaqah',
    )
    semester_aktif = models.CharField(max_length=50, default='2025-Ganjil')

    def __str__(self):
        return self.nama_kelompok


class Mentee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentee_profile')
    halaqah = models.ForeignKey(
        Halaqah, on_delete=models.SET_NULL, null=True, blank=True, related_name='anggota_mentee',
    )
    nim = models.CharField(max_length=20, unique=True)
    nama_lengkap = models.CharField(max_length=255)
    prodi = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nim} - {self.nama_lengkap}"


class Jadwal(models.Model):
    MAX_PERTEMUAN = 12

    halaqah = models.ForeignKey(Halaqah, on_delete=models.CASCADE, related_name='jadwal_pertemuan')
    semester = models.CharField(max_length=50, default='2025-Ganjil')
    pertemuan_ke = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    tanggal = models.DateField(null=True, blank=True)
    topik = models.CharField(max_length=255, blank=True, default='')
    kehadiran_mentor = models.BooleanField(default=True)
    laporan_kegiatan = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('halaqah', 'semester', 'pertemuan_ke')
        ordering = ['semester', 'pertemuan_ke']

    def __str__(self):
        return f"Pertemuan {self.pertemuan_ke} - {self.halaqah.nama_kelompok} ({self.semester})"


class MateriMentoring(models.Model):
    TIPE_CHOICES = (
        ('FILE', 'File / PDF'),
        ('LINK', 'Tautan'),
        ('VIDEO', 'Video'),
    )
    jadwal = models.OneToOneField(Jadwal, on_delete=models.CASCADE, related_name='materi')
    judul = models.CharField(max_length=255)
    deskripsi = models.TextField(blank=True, default='')
    tipe = models.CharField(max_length=10, choices=TIPE_CHOICES, default='FILE')
    file = models.FileField(upload_to='uploads/materi/', null=True, blank=True)
    link_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.judul


class Presensi(models.Model):
    STATUS_CHOICES = (
        ('HADIR', 'Hadir'),
        ('IZIN', 'Izin'),
        ('SAKIT', 'Sakit'),
        ('ALPHA', 'Alpha'),
    )
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='presensi_mentee')
    jadwal = models.ForeignKey(Jadwal, on_delete=models.CASCADE, related_name='presensi_jadwal')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ALPHA')
    surat_izin = models.FileField(upload_to='uploads/surat_izin/', null=True, blank=True)
    waktu_input = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('mentee', 'jadwal')

    def __str__(self):
        return f"{self.mentee.nama_lengkap} - {self.status}"


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


class Hafalan(models.Model):
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE, related_name='hafalan_mentee')
    nama_surah = models.CharField(max_length=100)
    ayat_awal = models.IntegerField()
    ayat_akhir = models.IntegerField()
    nilai = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_lulus = models.BooleanField(default=False)
    catatan_mentor = models.TextField(null=True, blank=True)
    tanggal = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.mentee.nama_lengkap} - {self.nama_surah}"


class Sertifikat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sertifikat_user')
    nomor_sertifikat = models.CharField(max_length=100, unique=True)
    sebagai = models.CharField(max_length=20, choices=[('MENTOR', 'Mentor'), ('MENTEE', 'Mentee')])
    link_drive = models.URLField(max_length=500)
    tanggal_terbit = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Sertifikat {self.sebagai} - {self.user.username}"
