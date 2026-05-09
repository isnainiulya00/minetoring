from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated # Satpam Gerbang Utama
from .permissions import IsAdminOrReadOnly, IsMentorCanEditMenteeReadOnly # Satpam Khusus untuk Hafalan
from .models import Halaqah, Mentee, Mentor, Mentor, Presensi, Resume, Sertifikat, User, Koordinator, Jadwal, Hafalan
from .serializers import HafalanSerializer, HalaqahSerializer, JadwalSerializer, KoordinatorSerializer, MenteeSerializer, MentorSerializer, MentorSerializer, PresensiSerializer, ResumeSerializer, SertifikatSerializer, UserSerializer

# 1. Loket untuk mengurus data Halaqah
class HalaqahViewSet(viewsets.ModelViewSet):
    queryset = Halaqah.objects.all()
    serializer_class = HalaqahSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

# 2. Loket untuk mengurus data Mentee
class MenteeViewSet(viewsets.ModelViewSet):
    queryset = Mentee.objects.all()
    serializer_class = MenteeSerializer

class HafalanViewSet(viewsets.ModelViewSet):
    queryset = Hafalan.objects.all()
    serializer_class = HafalanSerializer
    permission_classes = [IsAuthenticated, IsMentorCanEditMenteeReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        # Jika Admin, boleh lihat semua data
        if user.is_staff:
            return Hafalan.objects.all()
        
        # Jika Mentor, hanya lihat data hafalan milik Mentee di kelompoknya
        if hasattr(user, 'mentor_user'):
            return Hafalan.objects.filter(mentee__halaqah__mentor__user=user)
        
        # Jika Mentee, HANYA lihat data miliknya sendiri
        if hasattr(user, 'mentee_user'):
            return Hafalan.objects.filter(mentee__user=user)
            
        return Hafalan.objects.none()

class JadwalViewSet(viewsets.ModelViewSet):
    queryset = Jadwal.objects.all()
    serializer_class = JadwalSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class KoordinatorViewSet(viewsets.ModelViewSet):
    queryset = Koordinator.objects.all()
    serializer_class = KoordinatorSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer

class PresensiViewSet(viewsets.ModelViewSet):
    queryset = Presensi.objects.all()
    serializer_class = PresensiSerializer

    def get_queryset(self):
        user = self.request.user
        
        # 1. Jika Admin, tampilkan seluruh absen kampus
        if user.is_staff:
            return Presensi.objects.all()
        
        # 2. Jika Mentor, tampilkan absen milik mentee di kelompoknya saja
        if hasattr(user, 'mentor_user'):
            return Presensi.objects.filter(mentee__halaqah__mentor__user=user)
        
        # 3. Jika Mentee, tampilkan daftar absen atas namanya sendiri
        if hasattr(user, 'mentee_user'):
            return Presensi.objects.filter(mentee__user=user)
            
        return Presensi.objects.none()

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return Resume.objects.all()
            
        if hasattr(user, 'mentor_user'):
            return Resume.objects.filter(mentee__halaqah__mentor__user=user)
            
        if hasattr(user, 'mentee_user'):
            return Resume.objects.filter(mentee__user=user)
            
        return Resume.objects.none()

class SertifikatViewSet(viewsets.ModelViewSet):
    queryset = Sertifikat.objects.all()
    serializer_class = SertifikatSerializer

    def get_queryset(self):
        user = self.request.user
        
        # 1. Admin bisa melihat dan mengelola semua sertifikat
        if user.is_staff:
            return Sertifikat.objects.all()
            
        # 2. User biasa (Mentor/Mentee) HANYA bisa melihat sertifikat miliknya sendiri
        return Sertifikat.objects.filter(user=user)