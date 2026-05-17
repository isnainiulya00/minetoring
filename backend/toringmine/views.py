from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .permissions import (
    IsAdminOrReadOnly,
    IsKMFOrReadOnly,
    IsMentorCanEditMenteeReadOnly,
    IsMentorPresensiOnly,
    IsResumePermission,
)
from .models import Halaqah, Mentee, Mentor, Presensi, Resume, Sertifikat, User, Koordinator, Jadwal, Hafalan
from .serializers import (
    HafalanSerializer,
    HalaqahSerializer,
    JadwalSerializer,
    KoordinatorSerializer,
    MenteeSerializer,
    MentorSerializer,
    PresensiSerializer,
    ResumeSerializer,
    SertifikatSerializer,
    UserSerializer,
)


def _is_monitoring_role(user):
    return user.role in ('ADMIN', 'KMF') or user.is_staff


class HalaqahViewSet(viewsets.ModelViewSet):
    queryset = Halaqah.objects.all()
    serializer_class = HalaqahSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class MenteeViewSet(viewsets.ModelViewSet):
    queryset = Mentee.objects.all()
    serializer_class = MenteeSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class HafalanViewSet(viewsets.ModelViewSet):
    queryset = Hafalan.objects.all()
    serializer_class = HafalanSerializer
    permission_classes = [IsAuthenticated, IsMentorCanEditMenteeReadOnly]

    def get_queryset(self):
        user = self.request.user
        if _is_monitoring_role(user):
            return Hafalan.objects.all()
        if hasattr(user, 'mentor_profile'):
            return Hafalan.objects.filter(mentee__halaqah__mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return Hafalan.objects.filter(mentee__user=user)
        return Hafalan.objects.none()


class JadwalViewSet(viewsets.ModelViewSet):
    queryset = Jadwal.objects.all()
    serializer_class = JadwalSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class KoordinatorViewSet(viewsets.ModelViewSet):
    queryset = Koordinator.objects.all()
    serializer_class = KoordinatorSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]


class PresensiViewSet(viewsets.ModelViewSet):
    queryset = Presensi.objects.all()
    serializer_class = PresensiSerializer
    permission_classes = [IsAuthenticated, IsMentorPresensiOnly]

    def get_queryset(self):
        user = self.request.user
        if _is_monitoring_role(user):
            return Presensi.objects.all()
        if hasattr(user, 'mentor_profile'):
            return Presensi.objects.filter(mentee__halaqah__mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return Presensi.objects.filter(mentee__user=user)
        return Presensi.objects.none()


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsResumePermission]

    def get_queryset(self):
        user = self.request.user
        if _is_monitoring_role(user):
            return Resume.objects.all()
        if hasattr(user, 'mentor_profile'):
            return Resume.objects.filter(mentee__halaqah__mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return Resume.objects.filter(mentee__user=user)
        return Resume.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'MENTEE' and hasattr(user, 'mentee_profile'):
            serializer.save(mentee=user.mentee_profile)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'MENTEE' and hasattr(user, 'mentee_profile'):
            if serializer.instance.mentee_id != user.mentee_profile.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Anda hanya dapat mengubah resume milik sendiri.')
        serializer.save()


class SertifikatViewSet(viewsets.ModelViewSet):
    queryset = Sertifikat.objects.all()
    serializer_class = SertifikatSerializer
    permission_classes = [IsAuthenticated, IsKMFOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if _is_monitoring_role(user):
            return Sertifikat.objects.all()
        return Sertifikat.objects.filter(user=user)
