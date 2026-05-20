from django.db.models import Count, Q
from rest_framework import serializers

from .models import (
    Hafalan,
    Halaqah,
    Jadwal,
    Koordinator,
    MateriMentoring,
    Mentee,
    Mentor,
    Presensi,
    Resume,
    Sertifikat,
    User,
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


class UserSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'foto', 'foto_url', 'no_hp',
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
        validated_data['is_staff'] = role_val in ('ADMIN', 'KMF')
        validated_data['is_superuser'] = role_val == 'ADMIN'
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        self._ensure_profile(user)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role_val = validated_data.get('role', instance.role)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if role_val:
            instance.is_staff = role_val in ('ADMIN', 'KMF')
            instance.is_superuser = role_val == 'ADMIN'
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
                    'nim': f'NIM-{user.id}',
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


class MentorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Mentor
        fields = '__all__'


class MenteeSerializer(serializers.ModelSerializer):
    presensi_summary = serializers.SerializerMethodField()
    halaqah_nama = serializers.CharField(source='halaqah.nama_kelompok', read_only=True)

    class Meta:
        model = Mentee
        fields = '__all__'

    def get_presensi_summary(self, obj):
        return presensi_summary(obj)


class HalaqahSerializer(serializers.ModelSerializer):
    mentor_nama = serializers.CharField(source='mentor.nama_lengkap', read_only=True)
    jumlah_mentee = serializers.SerializerMethodField()

    class Meta:
        model = Halaqah
        fields = '__all__'

    def get_jumlah_mentee(self, obj):
        return obj.anggota_mentee.count()


class JadwalSerializer(serializers.ModelSerializer):
    halaqah_nama = serializers.CharField(source='halaqah.nama_kelompok', read_only=True)
    materi = serializers.SerializerMethodField()

    class Meta:
        model = Jadwal
        fields = '__all__'

    def get_materi(self, obj):
        if hasattr(obj, 'materi'):
            return MateriMentoringSerializer(obj.materi, context=self.context).data
        return None


class MateriMentoringSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    jadwal_label = serializers.SerializerMethodField()

    class Meta:
        model = MateriMentoring
        fields = '__all__'

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_jadwal_label(self, obj):
        return f"Pertemuan {obj.jadwal.pertemuan_ke} - {obj.jadwal.halaqah.nama_kelompok}"

    def validate(self, attrs):
        tipe = attrs.get('tipe', getattr(self.instance, 'tipe', 'FILE'))
        if tipe == 'LINK' and not attrs.get('link_url') and not (self.instance and self.instance.link_url):
            raise serializers.ValidationError({'link_url': 'Tautan wajib diisi untuk tipe LINK.'})
        if tipe == 'FILE' and self.context.get('request') and self.context['request'].method == 'POST':
            if not attrs.get('file') and not attrs.get('link_url'):
                pass
        return attrs


class PresensiSerializer(serializers.ModelSerializer):
    mentee_nama = serializers.CharField(source='mentee.nama_lengkap', read_only=True)
    pertemuan_ke = serializers.IntegerField(source='jadwal.pertemuan_ke', read_only=True)
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


class HafalanSerializer(serializers.ModelSerializer):
    mentee_nama = serializers.CharField(source='mentee.nama_lengkap', read_only=True)

    class Meta:
        model = Hafalan
        fields = '__all__'


class KoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Koordinator
        fields = '__all__'


class SertifikatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sertifikat
        fields = '__all__'


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
    hafalan_lulus = serializers.IntegerField()
    hafalan_total = serializers.IntegerField()
