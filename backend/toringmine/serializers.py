from rest_framework import serializers
from .models import Hafalan, Halaqah, Jadwal, Koordinator, Mentee, Mentor, Presensi, Resume, Sertifikat, User

# 1. Penerjemah untuk tabel Halaqah
class HalaqahSerializer(serializers.ModelSerializer):
    class Meta:
        model = Halaqah
        fields = '__all__'  # Artinya: "Tolong terjemahkan semua kolom yang ada di tabel ini"

# 2. Penerjemah untuk tabel Mentee
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
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