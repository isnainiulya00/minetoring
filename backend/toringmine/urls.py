from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HalaqahViewSet, MenteeViewSet, HafalanViewSet, JadwalViewSet, KoordinatorViewSet, SertifikatViewSet, UserViewSet, MentorViewSet, PresensiViewSet, ResumeViewSet

# Kita buat 'Router' yang akan otomatis membuatkan rute URL
router = DefaultRouter()
router.register(r'halaqah', HalaqahViewSet)
router.register(r'mentee', MenteeViewSet)
router.register(r'hafalan', HafalanViewSet)
router.register(r'jadwal', JadwalViewSet)   
router.register(r'koordinator', KoordinatorViewSet)
router.register(r'user', UserViewSet)
router.register(r'mentor', MentorViewSet)
router.register(r'presensi', PresensiViewSet)
router.register(r'resume', ResumeViewSet)
router.register(r'sertifikat', SertifikatViewSet)


urlpatterns = [
    # Semua URL yang dibuat oleh router akan dimasukkan ke sini
    path('', include(router.urls)),
]