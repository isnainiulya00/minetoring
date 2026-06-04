import re
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import Q
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    NilaiUjian, User, Koordinator, Mentor, Halaqah, Mentee, 
    Jadwal, MateriMentoring, JurnalPertemuan, Presensi, 
    Resume, Mutabaah, InformasiKegiatan, Sertifikat
)
from .serializers import (
    NilaiUjianSerializer, UserSerializer, KoordinatorSerializer, MentorSerializer, 
    HalaqahSerializer, MenteeSerializer, JadwalSerializer, 
    MateriMentoringSerializer, JurnalPertemuanSerializer, 
    PresensiSerializer, ResumeSerializer, MutabaahSerializer, 
    InformasiKegiatanSerializer, SertifikatSerializer, 
    AddUserByKMFSerializer, HalaqahRekapSerializer
)

# ==========================================
# CUSTOM PERMISSIONS (SISTEM KEAMANAN ROLE)
# ==========================================

class LppikReadOnlyPermission(permissions.BasePermission):
    """Mencegah Admin LPPIK melakukan aksi CRUD (Hanya boleh Read/Melihat)"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' and request.method not in permissions.SAFE_METHODS:
            return False
        return True

# ==========================================
# 1. VIEWS MANAJEMEN USER (KHUSUS KMF)
# ==========================================

class TambahUserKMFView(APIView):
    """Endpoint khusus untuk KMF menambah User secara manual"""
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def post(self, request):
        if request.user.role != 'KMF':
            return Response({"detail": "Hanya KMF yang bisa menambah user manual."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AddUserByKMFSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User dan Profil berhasil dibuat!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]
    def perform_destroy(self, instance):
        user = instance.user  # Tangkap data akun login-nya dulu
        instance.delete()     # Hapus profil Mentor-nya
        if user:
            user.delete()

class MenteeViewSet(viewsets.ModelViewSet):
    queryset = Mentee.objects.all()
    serializer_class = MenteeSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['KMF', 'LPPIK'] or user.is_superuser:
            return Mentee.objects.all()
        if user.role == 'MENTOR':
            return Mentee.objects.filter(halaqah__mentor__user=user)
        if user.role == 'MENTEE':
            return Mentee.objects.filter(user=user)
        return Mentee.objects.none()

    def perform_destroy(self, instance):
        user = instance.user  # Tangkap data akun login-nya dulu
        instance.delete()     # Hapus profil Mentor-nya
        if user:
            user.delete()

class HalaqahViewSet(viewsets.ModelViewSet):
    queryset = Halaqah.objects.all()
    serializer_class = HalaqahSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user

        # 1. Jika yang login adalah KMF atau Admin (Bisa lihat semua halaqah)
        if user.role in ['KMF', 'LPPIK'] or user.is_superuser:
            return Halaqah.objects.all()

        # 2. Jika yang login adalah MENTOR
        elif user.role == 'MENTOR':
            # Cari halaqah yang kolom mentor-nya terhubung dengan akun yang sedang login
            return Halaqah.objects.filter(mentor__user=user)

        # 3. Jika yang login adalah MENTEE (Opsional, sekalian biar fiturnya lengkap)
        elif user.role == 'MENTEE':
            # Cari halaqah yang anggota menteenya terhubung dengan akun yang sedang login
            return Halaqah.objects.filter(anggota_mentee__user=user)

        # Jika role tidak dikenali, jangan tampilkan apa-apa
        return Halaqah.objects.none()

# ==========================================
# 2. VIEWS JADWAL & MATERI GLOBAL
# ==========================================

class JadwalViewSet(viewsets.ModelViewSet):
    queryset = Jadwal.objects.all()
    serializer_class = JadwalSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def create(self, request, *args, **kwargs):
        # --- PASANG CCTV DI SINI ---
        print("\n" + "="*40)
        print("🔍 ISI DATA TEKS DARI REACT:")
        print(request.data)
        print("-" * 40)
        print("📁 ISI DATA FILE DARI REACT:")
        print(request.FILES)
        print("="*40 + "\n")
        # ---------------------------

        pertemuan_ke = request.data.get('pertemuan_ke')
       

    def create(self, request, *args, **kwargs):
        pertemuan_ke = request.data.get('pertemuan_ke')
        tanggal = request.data.get('tanggal')
        semester = request.data.get('semester', '2025-Ganjil')

        jadwal = Jadwal.objects.create(
            pertemuan_ke=pertemuan_ke,
            tanggal=tanggal,
            semester=semester
        )

        materi_dict = {}
        for key, value in request.data.items():
            match = re.match(r'materi\[(\d+)\]\[(\w+)\]', key)
            if match:
                index = match.group(1)
                field = match.group(2)
                if index not in materi_dict:
                    materi_dict[index] = {}
                materi_dict[index][field] = value

        for key, file_obj in request.FILES.items():
            match = re.match(r'materi\[(\d+)\]\[file\]', key)
            if match:
                index = match.group(1)
                if index not in materi_dict:
                    materi_dict[index] = {}
                materi_dict[index]['file'] = file_obj

        for index, data in materi_dict.items():
            MateriMentoring.objects.create(
                jadwal=jadwal,
                topik=data.get('topik', ''),
                deskripsi=data.get('deskripsi', ''),
                url=data.get('url', None) or None,
                file=data.get('file', None)
            )

        serializer = self.get_serializer(jadwal)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        instance.pertemuan_ke = request.data.get('pertemuan_ke', instance.pertemuan_ke)
        instance.tanggal = request.data.get('tanggal', instance.tanggal)
        instance.save()

        materi_dict = {}
        for key, value in request.data.items():
            match = re.match(r'materi\[(\d+)\]\[(\w+)\]', key)
            if match:
                index = match.group(1)
                field = match.group(2)
                if index not in materi_dict:
                    materi_dict[index] = {}
                materi_dict[index][field] = value

        for key, file_obj in request.FILES.items():
            match = re.match(r'materi\[(\d+)\]\[file\]', key)
            if match:
                index = match.group(1)
                if index not in materi_dict:
                    materi_dict[index] = {}
                materi_dict[index]['file'] = file_obj

        if materi_dict:
            instance.materi.all().delete() 
            for index, data in materi_dict.items():
                MateriMentoring.objects.create(
                    jadwal=instance,
                    topik=data.get('topik', ''),
                    deskripsi=data.get('deskripsi', ''),
                    url=data.get('url', None) or None,
                    file=data.get('file', None)
                )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ==========================================
# 3. VIEWS PRESENSI & JURNAL (DENGAN FILTER ROLE)
# ==========================================

class JurnalPertemuanViewSet(viewsets.ModelViewSet):
    serializer_class = JurnalPertemuanSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'MENTOR':
            return JurnalPertemuan.objects.filter(halaqah__mentor__user=user)
        return JurnalPertemuan.objects.all()

    def perform_create(self, serializer):
        serializer.save(diisi_oleh=self.request.user)

class PresensiViewSet(viewsets.ModelViewSet):
    serializer_class = PresensiSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'MENTOR':
            return Presensi.objects.filter(mentee__halaqah__mentor__user=user)
        elif user.role == 'MENTEE':
            return Presensi.objects.filter(mentee__user=user)
        return Presensi.objects.all()

# ==========================================
# 4. VIEWS MUTABAAH & RESUME
# ==========================================

class MutabaahViewSet(viewsets.ModelViewSet):
    serializer_class = MutabaahSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['KMF', 'LPPIK']:
            return Mutabaah.objects.all()
        elif user.role == 'MENTOR':
            return Mutabaah.objects.filter(mentee__halaqah__mentor__user=user)
        elif user.role == 'MENTEE':
            # 👇 Biar mentee cuma bisa liat miliknya sendiri
            return Mutabaah.objects.filter(mentee__user=user)
        return Mutabaah.objects.none()

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'MENTOR':
            return Resume.objects.filter(mentee__halaqah__mentor__user=user)
        elif user.role == 'MENTEE':
            return Resume.objects.filter(mentee__user=user)
        return Resume.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'MENTEE' and hasattr(user, 'mentee_profile'):
            serializer.save(mentee=user.mentee_profile)
        else:
            serializer.save()

# ==========================================
# 5. VIEWS INFORMASI & SERTIFIKAT
# ==========================================

class InformasiKegiatanViewSet(viewsets.ModelViewSet):
    queryset = InformasiKegiatan.objects.all()
    serializer_class = InformasiKegiatanSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def perform_create(self, serializer):
        serializer.save(pembuat=self.request.user)

class SertifikatViewSet(viewsets.ModelViewSet):
    serializer_class = SertifikatSerializer
    permission_classes = [permissions.IsAuthenticated, LppikReadOnlyPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['MENTEE', 'MENTOR']:
            return Sertifikat.objects.filter(user=user)
        return Sertifikat.objects.all()
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_user_sertifikat(self, request):
        user_id = request.data.get('user_id')
        role_sebagai = request.data.get('sebagai')
        link_drive = request.data.get('link_sertifikat')

        try:
            user_obj = User.objects.get(id=user_id)
            Sertifikat.objects.create(
                user=user_obj,
                sebagai=role_sebagai,
                link_sertifikat=link_drive
            )
            return Response({'status': 'Sertifikat berhasil ditambahkan!'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'status': 'User tidak ditemukan.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    # Cek apakah yang minta data ini adalah KMF atau ADMIN (LPPIK)
    user_role = request.user.role.upper()
    if user_role not in ['KMF', 'KOORDINATOR', 'ADMIN']:
        return Response({'detail': 'Akses ditolak.'}, status=status.HTTP_403_FORBIDDEN)

    # Hitung total data dari database
    total_mentee = Mentee.objects.count()
    total_mentor = Mentor.objects.count()
    total_halaqah = Halaqah.objects.count()

    # Kirim datanya dalam bentuk JSON ke React
    return Response({
        'total_mentee': total_mentee,
        'total_mentor': total_mentor,
        'total_halaqah': total_halaqah
    })

class NilaiUjianPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role in ['MENTEE', 'LPPIK']:
            return request.method in permissions.SAFE_METHODS
        return request.user.role in ['KMF', 'MENTOR']

class NilaiUjianViewSet(viewsets.ModelViewSet):
    serializer_class = NilaiUjianSerializer
    permission_classes = [NilaiUjianPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = NilaiUjian.objects.select_related('mentee', 'dinilai_oleh')

        if user.role in ['KMF', 'LPPIK'] or user.is_superuser:
            return queryset
        if user.role == 'MENTOR':
            return queryset.filter(mentee__mentee_profile__halaqah__mentor__user=user)
        if user.role == 'MENTEE':
            return queryset.filter(mentee=user)
        return NilaiUjian.objects.none()

    def _ensure_can_grade(self, mentee_user):
        user = self.request.user
        if user.role == 'KMF' or user.is_superuser:
            return
        if user.role == 'MENTOR' and Mentee.objects.filter(user=mentee_user, halaqah__mentor__user=user).exists():
            return
        raise PermissionDenied('Anda tidak memiliki akses untuk menilai mentee ini.')

    # Otomatis merekam siapa yang login saat nilai di-submit atau di-update
    def perform_create(self, serializer):
        self._ensure_can_grade(serializer.validated_data['mentee'])
        serializer.save(dinilai_oleh=self.request.user)

    def perform_update(self, serializer):
        mentee_user = serializer.validated_data.get('mentee', serializer.instance.mentee)
        self._ensure_can_grade(mentee_user)
        serializer.save(dinilai_oleh=self.request.user)
