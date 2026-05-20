from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AnalyticsOverviewView,
    HafalanViewSet,
    HalaqahViewSet,
    JadwalViewSet,
    KoordinatorViewSet,
    MateriMentoringViewSet,
    MenteeViewSet,
    MentorViewSet,
    PresensiViewSet,
    RekapHalaqahView,
    ResumeViewSet,
    SertifikatViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'halaqah', HalaqahViewSet)
router.register(r'mentee', MenteeViewSet)
router.register(r'hafalan', HafalanViewSet)
router.register(r'jadwal', JadwalViewSet)
router.register(r'materi', MateriMentoringViewSet)
router.register(r'koordinator', KoordinatorViewSet)
router.register(r'user', UserViewSet)
router.register(r'mentor', MentorViewSet)
router.register(r'presensi', PresensiViewSet)
router.register(r'resume', ResumeViewSet)
router.register(r'sertifikat', SertifikatViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('rekap/halaqah/', RekapHalaqahView.as_view(), name='rekap-halaqah'),
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
]