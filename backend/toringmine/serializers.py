from django.db.models import Count, Q
from rest_framework import serializers
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User

from .models import (
    Halaqah,
    Jadwal,
    Koordinator,
    MateriMentoring,
    Mentee,
    Mentor,
    NilaiUjian,
    Presensi,
    Resume,
    Sertifikat,
    User,
    JurnalPertemuan,
    Mutabaah,
    InformasiKegiatan,
)


def presensi_summary(mentee):
    agg = Presensi.objects.filter(mentee=mentee).values('status').annotate(c=Count('id'))
    counts = {row['status']: row['c'] for row in agg}
    return {
        'hadir': counts.get('HADIR', 0),
        'izin': counts.get('IZIN', 0),
        'sakit': counts.get('SAKIT', 0),
        'alpha': counts.get('ALPHA', 0),
        'total': sum(counts.values()),
    }


# ==========================================
# 1. USER & PROFIL
# ==========================================

class UserSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email', 'first_name', 'last_name',
            'role', 'nim', 'is_active', 'foto', 'foto_url', 'no_hp',
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'foto': {'write_only': True, 'required': False},
        }

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Password wajib diisi.'})
        role_val = validated_data.get('role', 'MENTEE')
        
        validated_data['is_staff'] = role_val in ('LPPIK', 'KMF')
        validated_data['is_superuser'] = role_val == 'LPPIK'
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # HAPUS ATAU JADIKAN KOMENTAR BARIS DI BAWAH INI:
        # self._ensure_profile(user) 
        
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role_val = validated_data.get('role', instance.role)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if role_val:
            instance.is_staff = role_val in ('LPPIK', 'KMF')
            instance.is_superuser = role_val == 'LPPIK'
        
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def _ensure_profile(self, user):
        if user.role == 'MENTOR':
            Mentor.objects.get_or_create(
                user=user,
                defaults={'nama_lengkap': user.get_full_name() or user.username, 'no_hp': user.no_hp or ''},
            )
        elif user.role == 'MENTEE':
            Mentee.objects.get_or_create(
                user=user,
                defaults={
                    'nim': user.nim or f'NIM-{user.id}',
                    'nama_lengkap': user.get_full_name() or user.username,
                    'prodi': '',
                },
            )
        elif user.role == 'KMF':
            Koordinator.objects.get_or_create(
                user=user,
                defaults={'nama_lengkap': user.get_full_name() or user.username, 'fakultas': ''},
            )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('password', None)
        return data

class AddUserByKMFSerializer(serializers.Serializer):
    """Digunakan khusus saat KMF menambah Mentor/Mentee secara manual via Frontend"""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    
    # 👇 UBAH: Dibuat opsional dan default-nya dihilangkan
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    nim = serializers.CharField(max_length=20, required=False, allow_blank=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    prodi = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fakultas = serializers.CharField(max_length=100, required=False, allow_blank=True)
    no_hp = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_nim(self, value):
        from .models import User
        if value and User.objects.filter(nim=value).exists():
            raise serializers.ValidationError("NIM ini sudah terdaftar di sistem!")
        return value

    def validate_username(self, value):
        from .models import User
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Akun dengan Username/NIM ini sudah ada.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            # Tangkap password dari form jika ada
            password_input = validated_data.pop('password', None)
            nim_input = validated_data.get('nim')
            username_input = validated_data.get('username')
            
            # 👇 LOGIKA BARU: Jika password kosong, otomatis pakai NIM. 
            # Jika NIM juga kosong, pakai Username.
            final_password = password_input or nim_input or username_input

            user = User.objects.create(
                username=username_input,
                email=validated_data.get('email', ''),
                role=validated_data['role'],
                nim=nim_input,
                first_name=validated_data.get('first_name', ''), 
                last_name=validated_data.get('last_name', ''),
                no_hp=validated_data.get('no_hp', '')
            )
            
            # Set password menggunakan NIM/Username tadi
            user.set_password(final_password)
            user.save()

            return user
class KoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Koordinator
        fields = '__all__'


class MentorSerializer(serializers.ModelSerializer):
    # Tarik data dari tabel User murni untuk DITAMPILKAN saja di tabel React (Read-Only)
    nim = serializers.CharField(source='user.nim', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    nama_kelompok_halaqah = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = '__all__'
        # ❌ depth = 1 DIHAPUS
        # ❌ fungsi def update DIHAPUS
    def get_nama_kelompok_halaqah(self, obj):
        from .models import Halaqah  # Pastikan import model Halaqah
        
        # Cari halaqah yang diampu oleh mentor ini
        halaqah = Halaqah.objects.filter(mentor=obj).first()
        if halaqah:
            return halaqah.nama_kelompok
        return None


class MenteeSerializer(serializers.ModelSerializer):
    presensi_summary = serializers.SerializerMethodField()
    halaqah_nama = serializers.CharField(source='halaqah.nama_kelompok', read_only=True)
    
    # Tarik email dari tabel User untuk info (NIM sudah ada bawaan di model Mentee)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Mentee
        fields = '__all__'
        # ❌ depth = 1 DIHAPUS
        # ❌ fungsi def update DIHAPUS

    def get_presensi_summary(self, obj):
        return presensi_summary(obj)

class MenteeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentee
        fields = ['id', 'nim', 'nama_lengkap']
class HalaqahSerializer(serializers.ModelSerializer):
    mentor_nama = serializers.CharField(source='mentor.nama_lengkap', read_only=True)
    jumlah_mentee = serializers.SerializerMethodField()
    
    # 👇 1. JEMBATAN UNTUK REACT
    # Mengajari Django untuk mengirim & menerima array ID dengan nama 'mentees'
    mentees = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Mentee.objects.all(),
        source='anggota_mentee', # Sesuai dengan related_name di models.py
        required=False
    )
    mentees = MenteeMiniSerializer(source='anggota_mentee', many=True, read_only=True)
    class Meta:
        model = Halaqah
        fields = '__all__'

    def get_jumlah_mentee(self, obj):
        return obj.anggota_mentee.count()

    # 👇 2. AJARI CARA MENYIMPAN SAAT CREATE
    def create(self, validated_data):
        mentees_data = validated_data.pop('anggota_mentee', [])
        halaqah = Halaqah.objects.create(**validated_data)
        
        # Masukkan mentee yang di-ceklis ke halaqah ini
        for mentee in mentees_data:
            mentee.halaqah = halaqah
            mentee.save()
            
        return halaqah

    # 👇 3. AJARI CARA MENYIMPAN SAAT EDIT
    def update(self, instance, validated_data):
        mentees_data = validated_data.pop('anggota_mentee', None)
        
        # Update data halaqah (nama, tingkat, mentor, dll)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update daftar mentee jika ada yang di-ceklis / di-uncheck
        if mentees_data is not None:
            # Kosongkan halaqah dari mentee lama terlebih dahulu
            instance.anggota_mentee.all().update(halaqah=None)
            # Pasangkan halaqah ke mentee yang baru dipilih
            for mentee in mentees_data:
                mentee.halaqah = instance
                mentee.save()
                
        return instance


# ==========================================
# 2. KURIKULUM GLOBAL
# ==========================================

from rest_framework import serializers
from .models import Jadwal, MateriMentoring

# 1. Serializer untuk Materi
class MateriMentoringSerializer(serializers.ModelSerializer):
    class Meta:
        model = MateriMentoring
        # Pastikan namanya sama persis dengan yang kita ubah di models.py
        fields = ['id', 'topik', 'deskripsi', 'file', 'url']

# 2. Serializer untuk Jadwal
class JadwalSerializer(serializers.ModelSerializer):
    # INI KUNCI UTAMANYA: 
    # Kita suruh Django mengemas data materi secara UTUH (termasuk topik dll), 
    # bukan cuma mengirim angka ID-nya saja.
    # Nama 'materi' di sini harus sama dengan related_name='materi' di models.py
    materi = MateriMentoringSerializer(many=True, read_only=True)

    class Meta:
        model = Jadwal
        fields = ['id', 'pertemuan_ke', 'semester', 'tanggal', 'materi']

# ==========================================
# 3. EKSEKUSI & PRESENSI (PER HALAQAH)
# ==========================================

class JurnalPertemuanSerializer(serializers.ModelSerializer):
    halaqah_nama = serializers.CharField(source='halaqah.nama_kelompok', read_only=True)
    pertemuan_ke = serializers.IntegerField(source='jadwal.pertemuan_ke', read_only=True)
    topik_jadwal = serializers.CharField(source='jadwal.topik', read_only=True)
    pengisi_nama = serializers.CharField(source='diisi_oleh.get_full_name', read_only=True, default='')

    class Meta:
        model = JurnalPertemuan
        fields = '__all__'


class PresensiSerializer(serializers.ModelSerializer):
    mentee_nama = serializers.CharField(source='mentee.nama_lengkap', read_only=True)
    # Narik nomor pertemuan dari relasi Jurnal -> Jadwal
    pertemuan_ke = serializers.IntegerField(source='jadwal.pertemuan_ke', read_only=True)
    tanggal_jadwal = serializers.DateField(source='jadwal.tanggal', read_only=True)
    surat_izin_url = serializers.SerializerMethodField()

    class Meta:
        model = Presensi
        fields = '__all__'

    def get_surat_izin_url(self, obj):
        if obj.surat_izin:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.surat_izin.url)
            return obj.surat_izin.url
        return None

    def validate(self, attrs):
        status = attrs.get('status', getattr(self.instance, 'status', None))
        surat = attrs.get('surat_izin')
        if status == 'IZIN' and not surat and not (self.instance and self.instance.surat_izin):
            raise serializers.ValidationError({'surat_izin': 'Surat izin wajib diunggah untuk status Izin.'})
        return attrs


# ==========================================
# 4. PENILAIAN & MUTABAAH
# ==========================================

class ResumeSerializer(serializers.ModelSerializer):
    mentee_nama = serializers.CharField(source='mentee.nama_lengkap', read_only=True)
    pertemuan_ke = serializers.IntegerField(source='jadwal.pertemuan_ke', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = '__all__'

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


from rest_framework import serializers
from .models import Mutabaah

class MutabaahSerializer(serializers.ModelSerializer):
    nama_mentee = serializers.SerializerMethodField()
    nim_mentee = serializers.SerializerMethodField()
    nama_halaqah = serializers.SerializerMethodField()
    tingkat = serializers.SerializerMethodField() # 👈 TAMBAHKAN INI

    class Meta:
        model = Mutabaah
        fields = [
            'id', 'mentee', 'pertemuan_ke', 'tanggal', 'materi_bacaan', 
            'rentang_bacaan', 'catatan_mentor',
            'nama_mentee', 'nim_mentee', 'nama_halaqah', 'tingkat'
        ]

    def get_nama_mentee(self, obj):
        return obj.mentee.nama_lengkap if obj.mentee else "Unknown"

    def get_nim_mentee(self, obj):
        return obj.mentee.nim if obj.mentee else "-"

    def get_nama_halaqah(self, obj):
        if obj.mentee and obj.mentee.halaqah:
            return obj.mentee.halaqah.nama_kelompok
        return "Belum diplot"

    # 👇 FUNGSI AMANKAN TINGKAT HALAQAH 👇
    def get_tingkat(self, obj):
        if obj.mentee and obj.mentee.halaqah:
            return obj.mentee.halaqah.get_tingkat_display() # Mengambil 'Tahsin'/'Takhasus'/'Tahfidz'
        return "-"
# ==========================================
# 5. INFORMASI & SERTIFIKAT
# ==========================================

class InformasiKegiatanSerializer(serializers.ModelSerializer):
    # Jika kamu menampilkan nama pembuat secara detail, bisa tambahkan read_only serializer di sini
    
    class Meta:
        model = InformasiKegiatan
        # ⚠️ GANTI 'deskripsi' MENJADI 'isi' DI SINI
        fields = [
            'id', 
            'judul', 
            'kategori', 
            'isi',            # <-- Sudah disesuaikan
            'tanggal_kegiatan', 
            'poster', 
            'dibuat_pada', 
            'pembuat'
        ]

from .models import Sertifikat, Mentee # Pastikan Mentee ke-import kalau belum

class SertifikatSerializer(serializers.ModelSerializer):
    nim = serializers.CharField(source='user.nim', read_only=True)
    nama_lengkap = serializers.CharField(source='user.first_name', read_only=True)
    nama_halaqah = serializers.SerializerMethodField()
    tingkat = serializers.SerializerMethodField()

    class Meta:
        model = Sertifikat
        fields = ['id', 'user', 'nim', 'nama_lengkap', 'sebagai', 'link_sertifikat', 'tanggal_terbit', 'nama_halaqah', 'tingkat']

    def get_nama_halaqah(self, obj):
        # Kebal terhadap huruf besar/kecil dari Excel
        role = str(obj.sebagai).upper() 
        
        if role == 'MENTEE':
            mentee = Mentee.objects.filter(user=obj.user).first()
            return mentee.halaqah.nama_kelompok if mentee and mentee.halaqah else "-"
            
        elif role == 'MENTOR':
            mentor = Mentor.objects.filter(user=obj.user).first()
            if mentor:
                # Cari halaqah yang dipegang sama mentor ini
                halaqah = Halaqah.objects.filter(mentor=mentor).first()
                return halaqah.nama_kelompok if halaqah else "-"
        return "-"

    def get_tingkat(self, obj):
        role = str(obj.sebagai).upper()
        if role == 'MENTEE':
            mentee = Mentee.objects.filter(user=obj.user).first()
            return mentee.halaqah.tingkat if mentee and mentee.halaqah else "-"
        return "-"


# ==========================================
# 6. CUSTOM SERIALIZERS (REKAP DASBOR)
# ==========================================

class HalaqahRekapSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nama_kelompok = serializers.CharField()
    tingkat = serializers.CharField()
    mentor_nama = serializers.CharField(allow_null=True)
    jumlah_mentee = serializers.IntegerField()
    semester = serializers.CharField()
    
    total_pertemuan = serializers.IntegerField()
    presensi_hadir = serializers.IntegerField()
    presensi_izin = serializers.IntegerField()
    presensi_sakit = serializers.IntegerField()
    presensi_alpha = serializers.IntegerField()
    
    resume_terkumpul = serializers.IntegerField()
    resume_total = serializers.IntegerField()
    
   
    mutabaah_total = serializers.IntegerField()



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        # 1. Cari user di database
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed('Username atau password salah.')

        # 2. Cek apakah passwordnya benar
        if not user.check_password(password):
            raise AuthenticationFailed('Username atau password salah.')

        # 3. Jika username & password BENAR, tapi statusnya MATI
        if not user.is_active:
            raise AuthenticationFailed('Akun Anda belum aktif. Silakan hubungi admin KMF.')

        # 4. Jika lolos semua, lanjutkan buatin token bawaan
        return super().validate(attrs)

class NilaiUjianSerializer(serializers.ModelSerializer):
    mentee_nama = serializers.SerializerMethodField()
    mentee_nim = serializers.SerializerMethodField()
    mentee_prodi = serializers.SerializerMethodField()
    halaqah_nama = serializers.SerializerMethodField()
    dinilai_oleh_nama = serializers.SerializerMethodField()

    class Meta:
        model = NilaiUjian
        fields = [
            'id',
            'mentee',
            'mentee_nama',
            'mentee_nim',
            'mentee_prodi',
            'halaqah_nama',
            'aspek_1',
            'aspek_2',
            'aspek_3',
            'aspek_4',
            'aspek_5',
            'total_nilai',
            'status_lulus',
            'dinilai_oleh',
            'dinilai_oleh_nama',
        ]
        # Pastikan kolom ini read-only agar user tidak bisa memanipulasi total via API
        read_only_fields = ['total_nilai', 'status_lulus', 'dinilai_oleh']

    def _mentee_profile(self, obj):
        return Mentee.objects.filter(user=obj.mentee).select_related('halaqah').first()

    def get_mentee_nama(self, obj):
        profile = self._mentee_profile(obj)
        if profile:
            return profile.nama_lengkap
        return obj.mentee.first_name or obj.mentee.username

    def get_mentee_nim(self, obj):
        profile = self._mentee_profile(obj)
        return profile.nim if profile else obj.mentee.nim

    def get_mentee_prodi(self, obj):
        profile = self._mentee_profile(obj)
        return profile.prodi if profile else '-'

    def get_halaqah_nama(self, obj):
        profile = self._mentee_profile(obj)
        return profile.halaqah.nama_kelompok if profile and profile.halaqah else '-'

    def get_dinilai_oleh_nama(self, obj):
        if not obj.dinilai_oleh:
            return '-'
        return obj.dinilai_oleh.first_name or obj.dinilai_oleh.username
