from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .permissions import (
    IsAdminSertifikatWrite,
    IsJadwalWrite,
    IsKMFMateriWrite,
    IsKMFWrite,
    IsMentorHafalanWrite,
    IsMentorPresensiWrite,
    IsOwnProfileOrKMF,
    IsResumePermission,
)
from .serializers import (
    HafalanSerializer,
    HalaqahRekapSerializer,
    HalaqahSerializer,
    JadwalSerializer,
    KoordinatorSerializer,
    MateriMentoringSerializer,
    MenteeSerializer,
    MentorSerializer,
    PresensiSerializer,
    ResumeSerializer,
    SertifikatSerializer,
    UserSerializer,
)


def user_role(user):
    return getattr(user, 'role', None)


def is_monitoring(user):
    return user_role(user) in ('ADMIN', 'KMF')


def mentor_halaqah_qs(user):
    return Q(halaqah__mentor__user=user)


def mentor_owns_mentee(user, mentee):
    if not hasattr(user, 'mentor_profile'):
        return False
    return mentee.halaqah_id and mentee.halaqah.mentor_id == user.mentor_profile.id


def mentor_owns_presensi(user, presensi):
    return mentor_owns_mentee(user, presensi.mentee)


class ScopedQuerysetMixin:
    mentor_lookup = 'halaqah__mentor__user'
    mentee_lookup = 'user'

    def get_mentee_queryset(self, qs):
        user = self.request.user
        if is_monitoring(user):
            return qs
        if hasattr(user, 'mentor_profile'):
            return qs.filter(**{self.mentor_lookup: user})
        if hasattr(user, 'mentee_profile'):
            return qs.filter(mentee__user=user)
        return qs.none()

    def get_halaqah_queryset(self, qs):
        user = self.request.user
        if is_monitoring(user):
            return qs
        if hasattr(user, 'mentor_profile'):
            return qs.filter(mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return qs.filter(anggota_mentee__user=user).distinct()
        return qs.none()


class HalaqahViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Halaqah.objects.select_related('mentor').all()
    serializer_class = HalaqahSerializer
    permission_classes = [IsAuthenticated, IsKMFWrite]

    def get_queryset(self):
        return self.get_halaqah_queryset(super().get_queryset())

    @action(detail=True, methods=['post'], url_path='init-semester')
    def init_semester(self, request, pk=None):
        if user_role(request.user) != 'KMF':
            raise PermissionDenied('Hanya KMF yang dapat membuat lembar semester.')
        halaqah = self.get_object()
        semester = request.data.get('semester') or halaqah.semester_aktif
        if Jadwal.objects.filter(halaqah=halaqah, semester=semester).exists():
            raise ValidationError({'semester': 'Lembar semester ini sudah ada.'})
        created = []
        for i in range(1, Jadwal.MAX_PERTEMUAN + 1):
            j, _ = Jadwal.objects.get_or_create(
                halaqah=halaqah,
                semester=semester,
                pertemuan_ke=i,
                defaults={'topik': f'Pertemuan {i}'},
            )
            created.append(j)
            for mentee in halaqah.anggota_mentee.all():
                Presensi.objects.get_or_create(mentee=mentee, jadwal=j, defaults={'status': 'ALPHA'})
        halaqah.semester_aktif = semester
        halaqah.save(update_fields=['semester_aktif'])
        return Response(JadwalSerializer(created, many=True, context={'request': request}).data)


class MenteeViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Mentee.objects.select_related('halaqah', 'user').all()
    serializer_class = MenteeSerializer
    permission_classes = [IsAuthenticated, IsKMFWrite]

    def get_queryset(self):
        return self.get_mentee_queryset(super().get_queryset())


class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.select_related('user').all()
    serializer_class = MentorSerializer
    permission_classes = [IsAuthenticated, IsKMFWrite]


class JadwalViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Jadwal.objects.select_related('halaqah').prefetch_related('materi').all()
    serializer_class = JadwalSerializer
    permission_classes = [IsAuthenticated, IsJadwalWrite]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if is_monitoring(user):
            return qs
        if hasattr(user, 'mentor_profile'):
            return qs.filter(halaqah__mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return qs.filter(halaqah__anggota_mentee__user=user).distinct()
        return qs.none()

    def perform_create(self, serializer):
        if user_role(self.request.user) != 'KMF':
            raise PermissionDenied('Hanya KMF yang dapat membuat jadwal.')
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        role = user_role(user)
        if role == 'KMF':
            serializer.save()
            return
        if role == 'MENTOR':
            allowed = {'kehadiran_mentor', 'laporan_kegiatan'}
            instance = serializer.instance
            if not hasattr(user, 'mentor_profile') or instance.halaqah.mentor_id != user.mentor_profile.id:
                raise PermissionDenied()
            data = {k: v for k, v in serializer.validated_data.items() if k in allowed}
            for k, v in data.items():
                setattr(instance, k, v)
            instance.save()
            return
        raise PermissionDenied()

    def perform_destroy(self, instance):
        if user_role(self.request.user) != 'KMF':
            raise PermissionDenied()
        instance.delete()


class MateriMentoringViewSet(viewsets.ModelViewSet):
    queryset = MateriMentoring.objects.select_related('jadwal__halaqah').all()
    serializer_class = MateriMentoringSerializer
    permission_classes = [IsAuthenticated, IsKMFMateriWrite]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if is_monitoring(user):
            return qs
        if hasattr(user, 'mentor_profile'):
            return qs.filter(jadwal__halaqah__mentor__user=user)
        if hasattr(user, 'mentee_profile'):
            return qs.filter(jadwal__halaqah__anggota_mentee__user=user).distinct()
        return qs.none()


class PresensiViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Presensi.objects.select_related('mentee', 'jadwal').all()
    serializer_class = PresensiSerializer
    permission_classes = [IsAuthenticated, IsMentorPresensiWrite]
    mentor_lookup = 'mentee__halaqah__mentor__user'

    def get_queryset(self):
        return self.get_mentee_queryset(super().get_queryset())

    def perform_create(self, serializer):
        user = self.request.user
        if user_role(user) != 'MENTOR':
            raise PermissionDenied()
        mentee = serializer.validated_data.get('mentee')
        if mentee and not mentor_owns_mentee(user, mentee):
            raise PermissionDenied('Mentee tidak berada di halaqah Anda.')
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user_role(user) != 'MENTOR':
            raise PermissionDenied()
        if not mentor_owns_presensi(user, serializer.instance):
            raise PermissionDenied('Presensi tidak berada di halaqah Anda.')
        serializer.save()


class ResumeViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Resume.objects.select_related('mentee', 'jadwal').all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsResumePermission]
    mentor_lookup = 'mentee__halaqah__mentor__user'

    def get_queryset(self):
        return self.get_mentee_queryset(super().get_queryset())

    def perform_create(self, serializer):
        user = self.request.user
        if user_role(user) == 'MENTEE' and hasattr(user, 'mentee_profile'):
            serializer.save(mentee=user.mentee_profile)
        else:
            raise PermissionDenied('Hanya mentee yang dapat mengunggah resume.')

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance
        role = user_role(user)
        if role == 'MENTEE':
            if not hasattr(user, 'mentee_profile') or instance.mentee_id != user.mentee_profile.id:
                raise PermissionDenied('Anda hanya dapat mengubah resume milik sendiri.')
            allowed = {'file', 'jadwal'}
            data = {k: v for k, v in serializer.validated_data.items() if k in allowed}
            for k, v in data.items():
                setattr(instance, k, v)
            instance.save()
            return
        if role == 'MENTOR':
            data = {k: v for k, v in serializer.validated_data.items() if k in ('nilai', 'catatan_mentor')}
            for k, v in data.items():
                setattr(instance, k, v)
            instance.save()
            return
        raise PermissionDenied()

    def perform_destroy(self, instance):
        user = self.request.user
        if user_role(user) == 'MENTEE' and hasattr(user, 'mentee_profile'):
            if instance.mentee_id != user.mentee_profile.id:
                raise PermissionDenied()
            instance.delete()
            return
        raise PermissionDenied('Hanya mentee yang dapat menghapus resume sendiri.')


class HafalanViewSet(ScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Hafalan.objects.select_related('mentee').all()
    serializer_class = HafalanSerializer
    permission_classes = [IsAuthenticated, IsMentorHafalanWrite]
    mentor_lookup = 'mentee__halaqah__mentor__user'

    def get_queryset(self):
        return self.get_mentee_queryset(super().get_queryset())

    def perform_create(self, serializer):
        user = self.request.user
        if user_role(user) != 'MENTOR':
            raise PermissionDenied()
        mentee = serializer.validated_data.get('mentee')
        if mentee and not mentor_owns_mentee(user, mentee):
            raise PermissionDenied('Mentee tidak berada di halaqah Anda.')
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user_role(user) != 'MENTOR':
            raise PermissionDenied()
        if not mentor_owns_mentee(user, serializer.instance.mentee):
            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user_role(user) != 'MENTOR':
            raise PermissionDenied()
        if not mentor_owns_mentee(user, instance.mentee):
            raise PermissionDenied()
        instance.delete()


class SertifikatViewSet(viewsets.ModelViewSet):
    queryset = Sertifikat.objects.select_related('user').all()
    serializer_class = SertifikatSerializer
    permission_classes = [IsAuthenticated, IsAdminSertifikatWrite]

    def get_queryset(self):
        user = self.request.user
        if user_role(user) in ('ADMIN', 'KMF'):
            return Sertifikat.objects.all()
        return Sertifikat.objects.filter(user=user)


class KoordinatorViewSet(viewsets.ModelViewSet):
    queryset = Koordinator.objects.all()
    serializer_class = KoordinatorSerializer
    permission_classes = [IsAuthenticated, IsKMFWrite]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ('retrieve', 'update', 'partial_update') and self.kwargs.get('pk') == str(self.request.user.id):
            return [IsAuthenticated(), IsOwnProfileOrKMF()]
        if self.action in ('me',):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsKMFWrite()]

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user, context={'request': request}).data)
        serializer = UserSerializer(
            request.user, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        password = request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(UserSerializer(user, context={'request': request}).data)


class RekapHalaqahView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if user_role(request.user) not in ('ADMIN', 'KMF', 'MENTOR'):
            return Response({'detail': 'Akses ditolak.'}, status=status.HTTP_403_FORBIDDEN)

        qs = Halaqah.objects.select_related('mentor').annotate(
            jumlah_mentee=Count('anggota_mentee', distinct=True),
        )
        if hasattr(request.user, 'mentor_profile'):
            qs = qs.filter(mentor__user=request.user)

        semester = request.query_params.get('semester')
        data = []
        for h in qs:
            sem = semester or h.semester_aktif
            jadwal_ids = list(
                Jadwal.objects.filter(halaqah=h, semester=sem).values_list('id', flat=True),
            )
            mentee_ids = list(h.anggota_mentee.values_list('id', flat=True))
            presensi = Presensi.objects.filter(jadwal_id__in=jadwal_ids, mentee_id__in=mentee_ids)
            agg = presensi.values('status').annotate(c=Count('id'))
            counts = {row['status']: row['c'] for row in agg}
            resume_qs = Resume.objects.filter(jadwal_id__in=jadwal_ids, mentee_id__in=mentee_ids)
            resume_total = len(mentee_ids) * max(len(jadwal_ids), 1) if mentee_ids else 0
            resume_done = resume_qs.exclude(file='').exclude(file__isnull=True).count()
            hafalan_qs = Hafalan.objects.filter(mentee_id__in=mentee_ids)
            data.append({
                'id': h.id,
                'nama_kelompok': h.nama_kelompok,
                'tingkat': h.tingkat,
                'mentor_nama': h.mentor.nama_lengkap if h.mentor else None,
                'jumlah_mentee': h.jumlah_mentee,
                'semester': sem,
                'total_pertemuan': len(jadwal_ids),
                'presensi_hadir': counts.get('HADIR', 0),
                'presensi_izin': counts.get('IZIN', 0),
                'presensi_sakit': counts.get('SAKIT', 0),
                'presensi_alpha': counts.get('ALPHA', 0),
                'resume_terkumpul': resume_done,
                'resume_total': resume_total,
                'hafalan_lulus': hafalan_qs.filter(is_lulus=True).count(),
                'hafalan_total': hafalan_qs.count(),
            })
        return Response(HalaqahRekapSerializer(data, many=True).data)


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = user_role(request.user)
        if role == 'MENTEE':
            return Response({'detail': 'Akses ditolak.'}, status=status.HTTP_403_FORBIDDEN)

        halaqah_qs = Halaqah.objects.all()
        mentee_qs = Mentee.objects.all()
        if hasattr(request.user, 'mentor_profile'):
            halaqah_qs = halaqah_qs.filter(mentor__user=request.user)
            mentee_qs = mentee_qs.filter(halaqah__mentor__user=request.user)
        presensi = Presensi.objects.filter(mentee__in=mentee_qs)
        agg = presensi.values('status').annotate(c=Count('id'))
        counts = {row['status']: row['c'] for row in agg}

        return Response({
            'role': role,
            'total_halaqah': halaqah_qs.count(),
            'total_mentee': mentee_qs.count(),
            'total_mentor': Mentor.objects.count() if role in ('ADMIN', 'KMF') else 1,
            'presensi': counts,
            'total_resume': Resume.objects.filter(mentee__in=mentee_qs).exclude(file='').exclude(file__isnull=True).count(),
            'total_hafalan': Hafalan.objects.filter(mentee__in=mentee_qs).count(),
        })
