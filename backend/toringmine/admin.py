from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources # 👇 TAMBAHKAN IMPORT INI
from .models import (
    User, Koordinator, Mentor, Halaqah, Mentee, 
    Jadwal, MateriMentoring, JurnalPertemuan, Presensi, 
    Resume, Mutabaah, InformasiKegiatan, Sertifikat
)

# ==========================================
# ATURAN OTOMATISASI IMPORT CSV USER
# ==========================================
class UserResource(resources.ModelResource):
    class Meta:
        model = User
        # Tentukan kolom apa saja yang boleh di-import dari CSV
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'nim', 'no_hp')
        import_id_fields = ('username',) # Jadikan username/NIM sebagai kunci utama

    def before_save_instance(self, instance, row, **kwargs):
        # 1. Bersihkan username dan nim dari spasi gaib bawaan Excel/CSV
        if instance.username:
            instance.username = str(instance.username).strip()
        if instance.nim:
            instance.nim = str(instance.nim).strip()

        # 2. JIKA USER BARU (Belum ada di database)
        if not instance.pk:
            # Otomatis enkripsi password menggunakan username (NIM)
            instance.set_password(instance.username)
            # Otomatis aktifkan akun biar bisa login
            instance.is_active = True
            
        # 3. JIKA USER LAMA (Update data via CSV)
        # Jika ada kolom password di CSV dan isinya teks biasa, kita enkripsi biar tidak rusak
        elif instance.password and not instance.password.startswith('pbkdf2_'):
            instance.set_password(instance.password)


# ==========================================
# 1. Manajemen User
# ==========================================
@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    resource_class = UserResource # 👇 HUBUNGKAN ATURAN IMPORT DI SINI
    
    list_display = ('username', 'email', 'role', 'nim', 'is_active') # Tambah is_active biar kelihatan di tabel
    list_filter = ('role', 'is_active')
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

# ==========================================
# 2. Halaqah & Kurikulum
# ==========================================
@admin.register(Halaqah)
class HalaqahAdmin(admin.ModelAdmin):
    list_display = ('nama_kelompok', 'tingkat', 'mentor', 'semester_aktif')
    list_filter = ('tingkat', 'semester_aktif')

@admin.register(Jadwal)
class JadwalAdmin(admin.ModelAdmin):
    list_display = ('pertemuan_ke', 'semester', 'tanggal')
    list_filter = ('semester',)

@admin.register(MateriMentoring)
class MateriMentoringAdmin(admin.ModelAdmin):
    list_display = ('topik', 'jadwal', 'file', 'url')
    search_fields = ('topik', 'deskripsi')

@admin.register(InformasiKegiatan)
class InformasiKegiatanAdmin(admin.ModelAdmin):
    list_display = ('judul', 'kategori', 'tanggal_kegiatan', 'pembuat')
    list_filter = ('kategori',)
    search_fields = ('judul', 'isi')

# ==========================================
# 4. Jurnal & Presensi
# ==========================================
@admin.register(JurnalPertemuan)
class JurnalPertemuanAdmin(admin.ModelAdmin):
    list_display = ('halaqah', 'jadwal', 'tanggal_pelaksanaan', 'mentor_hadir', 'diisi_oleh')
    list_filter = ('mentor_hadir', 'tanggal_pelaksanaan')

@admin.register(Presensi)
class PresensiAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'jurnal', 'status', 'waktu_input')
    list_filter = ('status',)

# ==========================================
# 5. Penilaian & Sertifikat
# ==========================================
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