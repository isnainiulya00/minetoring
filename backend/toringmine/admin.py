from django.contrib import admin
from import_export import widgets
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import Widget
from .models import (
    User, Koordinator, Mentor, Halaqah, Mentee, 
    Jadwal, MateriMentoring, JurnalPertemuan, Presensi, 
    Resume, Mutabaah, InformasiKegiatan, Sertifikat
)

# ==========================================
# ATURAN OTOMATISASI IMPORT CSV USER
# ==========================================
# 👇 1. BUAT ALAT PEMBERSIH ROLE KHUSUS
# 👇 ALAT PENCUCI ROLE RESMI
# 👇 Panggil langsung Widget (W besar)
class RoleWidget(Widget):
    def clean(self, value, row=None, *args, **kwargs):
        if value:
            # UBAH KE .upper() BIAR SAMA DENGAN DATABASE!
            return str(value).strip().upper() 
        return value

from import_export import resources, fields, widgets

class RoleWidget(widgets.Widget):
    def clean(self, value, row=None, *args, **kwargs):
        if value:
            return str(value).strip().upper() 
        return value

class UserResource(resources.ModelResource):
    nim = fields.Field(column_name='nim', attribute='nim')
    username = fields.Field(column_name='nim', attribute='username') 
    first_name = fields.Field(column_name='nama_lengkap', attribute='first_name')
    email = fields.Field(column_name='email', attribute='email')
    role = fields.Field(column_name='role', attribute='role', widget=RoleWidget()) 
    
    # 👇 1. KITA DAFTARKAN BIAR GAK DIBUANG MESIN 👇
    # attribute='_xxx' artinya kita simpan di saku rahasia (Atribut Sementara)
    halaqah_excel = fields.Field(column_name='halaqah', attribute='_halaqah_sementara', default='')
    tingkat_excel = fields.Field(column_name='tingkat', attribute='_tingkat_sementara', default='')
    prodi_excel = fields.Field(column_name='prodi', attribute='_prodi_sementara', default='-')

    class Meta:
        model = User
        import_id_fields = ('nim',)
        # 👇 WAJIB MASUKKAN NAMANYA KE SINI 👇
        fields = ('nim', 'username', 'email', 'first_name', 'role', 'halaqah_excel', 'tingkat_excel', 'prodi_excel')
        skip_unchanged = False

    def before_save_instance(self, instance, row, **kwargs):
        if not instance.pk:
            pwd = row.get('password') or row.get('nim')
            if pwd:
                instance.set_password(str(pwd).strip())
        elif instance.password and not instance.password.startswith('pbkdf2_'):
            instance.set_password(instance.password)

        instance.is_active = True

    def after_save_instance(self, instance, use_create, **kwargs):
        super().after_save_instance(instance, use_create, **kwargs)
        
        if getattr(instance, 'role', '') == 'MENTEE':
            
            # 👇 2. AMBIL DATA DARI SAKU RAHASIA 👇
            nama_halaqah_csv = getattr(instance, '_halaqah_sementara', '')
            tingkat_csv = getattr(instance, '_tingkat_sementara', '')
            prodi_csv = getattr(instance, '_prodi_sementara', '-')
            
            objek_halaqah = None
            
            if nama_halaqah_csv:
                nama_bersih = str(nama_halaqah_csv).strip()
                
                # Cari kelompoknya di database
                objek_halaqah = Halaqah.objects.filter(nama_kelompok__iexact=nama_bersih).first()
                
                # Auto-create kalau grup belum ada
                if not objek_halaqah:
                    tingkat_bersih = str(tingkat_csv).strip().upper() if tingkat_csv else 'TAHSIN'
                    # Mencegah database error kalau ada typo tingkat di excel
                    if tingkat_bersih not in ['TAKHASUS', 'TAHSIN', 'TAHFIDZ']:
                        tingkat_bersih = 'TAHSIN'
                        
                    objek_halaqah = Halaqah.objects.create(
                        nama_kelompok=nama_bersih,
                        tingkat=tingkat_bersih
                    )

            # Buat Profil Mentee
            Mentee.objects.update_or_create(
                user=instance, 
                defaults={
                    'nim': instance.nim,
                    'nama_lengkap': instance.first_name,
                    # Karena di CSV-mu beneran belum ada prodi, biarkan defaultnya strip '-'
                    'prodi': str(prodi_csv).strip() if prodi_csv else '-', 
                    'halaqah': objek_halaqah # SEKARANG PASTI TERISI!
                }
            )
            
        elif getattr(instance, 'role', '') == 'MENTOR':
            Mentor.objects.update_or_create(
                user=instance, 
                defaults={
                    'nama_lengkap': instance.first_name,
                }
            )
# =====
# 1. Manajemen User
# ==========================================
@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    resource_class = UserResource # 👇 HUBUNGKAN ATURAN IMPORT DI SINI
    
    list_display = ('username', 'email', 'role', 'nim', 'is_active') # Tambah is_active biar kelihatan di tabel
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'nim')
    def save_model(self, request, obj, form, change):
        # 1. JIKA INI ADALAH USER BARU (Create)
        if not obj.pk:
            # Jika admin mengisi kolom password, kita hash-kan.
            if obj.password:
                obj.set_password(obj.password)
            # Kalau admin membiarkan kolom password kosong, otomatis pakai Username/NIM!
            else:
                obj.set_password(obj.username)
                
            # Pastikan akun langsung aktif
            obj.is_active = True

        # 2. JIKA INI ADALAH USER LAMA YANG DI-EDIT (Update)
        else:
            # Cek apakah passwordnya adalah teks biasa (artinya admin baru saja mengubahnya).
            # Kalau passwordnya sudah di-hash ('pbkdf2_...'), jangan diotak-atik lagi biar tidak rusak.
            if obj.password and not obj.password.startswith('pbkdf2_'):
                obj.set_password(obj.password)

        # Lanjutkan proses simpan bawaan Django
        super().save_model(request, obj, form, change)

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