from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import (
    User, Koordinator, Mentor, Halaqah, Mentee, 
    Jadwal, MateriMentoring, JurnalPertemuan, Presensi, 
    Resume, Mutabaah, InformasiKegiatan, Sertifikat
)

# 1. Manajemen User
@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    list_display = ('username', 'email', 'role', 'nim')
    list_filter = ('role',)
    search_fields = ('username', 'email', 'nim')

@admin.register(Koordinator)
class KoordinatorAdmin(admin.ModelAdmin):
    list_display = ('nama_lengkap', 'fakultas')

@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ('nama_lengkap', 'no_hp')

@admin.register(Mentee)
class MenteeAdmin(admin.ModelAdmin):
    list_display = ('nim', 'nama_lengkap', 'prodi', 'halaqah')
    list_filter = ('prodi',)
    search_fields = ('nim', 'nama_lengkap')

# 2. Halaqah
@admin.register(Halaqah)
class HalaqahAdmin(admin.ModelAdmin):
    list_display = ('nama_kelompok', 'tingkat', 'mentor', 'semester_aktif')
    list_filter = ('tingkat', 'semester_aktif')

@admin.register(Jadwal)
class JadwalAdmin(admin.ModelAdmin):
    # Hapus 'topik' dari list_display karena sudah dipindah ke Materi
    list_display = ('pertemuan_ke', 'semester', 'tanggal')
    list_filter = ('semester',)

@admin.register(MateriMentoring)
class MateriMentoringAdmin(admin.ModelAdmin):
    # Ganti 'judul' jadi 'topik', dan hapus 'tipe'
    list_display = ('topik', 'jadwal', 'file', 'url')
    search_fields = ('topik', 'deskripsi')
    # list_filter = ('tipe',)  <-- Hapus atau komentari baris list_filter yang pakai 'tipe' ini

@admin.register(InformasiKegiatan)
class InformasiKegiatanAdmin(admin.ModelAdmin):
    list_display = ('judul', 'kategori', 'tanggal_kegiatan', 'pembuat')
    list_filter = ('kategori',)
    # Kalau sebelumnya ada 'deskripsi' di search_fields, ganti jadi 'isi'
    search_fields = ('judul', 'isi')

# 4. Jurnal & Presensi
@admin.register(JurnalPertemuan)
class JurnalPertemuanAdmin(admin.ModelAdmin):
    list_display = ('halaqah', 'jadwal', 'tanggal_pelaksanaan', 'mentor_hadir', 'diisi_oleh')
    list_filter = ('mentor_hadir', 'tanggal_pelaksanaan')

@admin.register(Presensi)
class PresensiAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'jurnal', 'status', 'waktu_input')
    list_filter = ('status',)

# 5. Penilaian
@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'jadwal', 'nilai')

@admin.register(Mutabaah)
class MutabaahAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'materi_bacaan', 'rentang_bacaan', 'nilai', 'tanggal')
    list_filter = ('tanggal',)


@admin.register(Sertifikat)
class SertifikatAdmin(admin.ModelAdmin):
    list_display = ('user', 'sebagai', 'nomor_sertifikat', 'tanggal_terbit')
    list_filter = ('sebagai',)