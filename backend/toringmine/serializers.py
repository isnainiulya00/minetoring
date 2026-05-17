from rest_framework import serializers
from .models import Hafalan, Halaqah, Jadwal, Koordinator, Mentee, Mentor, Presensi, Resume, Sertifikat, User


class HalaqahSerializer(serializers.ModelSerializer):
    class Meta:
        model = Halaqah
        fields = '__all__'


class MenteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentee
        fields = '__all__'


class HafalanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hafalan
        fields = '__all__'


class JadwalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jadwal
        fields = '__all__'


class KoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Koordinator
        fields = '__all__'


class MentorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentor
        fields = '__all__'


class PresensiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presensi
        fields = '__all__'


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'


class SertifikatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sertifikat
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_active',
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Password wajib diisi.'})

        role = validated_data.get('role', 'MENTEE')
        validated_data['is_staff'] = role in ('ADMIN', 'KMF')
        validated_data['is_superuser'] = role == 'ADMIN'

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'MENTOR':
            Mentor.objects.create(user=user, nama_lengkap=user.get_full_name() or user.username, no_hp='')
        elif user.role == 'MENTEE':
            Mentee.objects.create(
                user=user,
                nim=f'NIM-{user.id}',
                nama_lengkap=user.get_full_name() or user.username,
                prodi='',
            )
        elif user.role == 'KMF':
            Koordinator.objects.create(user=user, nama_lengkap=user.get_full_name() or user.username, fakultas='')

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role', instance.role)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if role:
            instance.is_staff = role in ('ADMIN', 'KMF')
            instance.is_superuser = role == 'ADMIN'

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('password', None)
        return data
