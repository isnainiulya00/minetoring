# Hapus "from django import views" biar tidak bentrok
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, MentorViewSet, MenteeViewSet, HalaqahViewSet,
    JadwalViewSet, JurnalPertemuanViewSet,
    PresensiViewSet, ResumeViewSet, MutabaahViewSet, 
    InformasiKegiatanViewSet, SertifikatViewSet, TambahUserKMFView, 
    dashboard_summary # 👈 Ini sudah di-import langsung
)

# Menggunakan DefaultRouter dari DRF untuk membuat rute otomatis (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'mentors', MentorViewSet, basename='mentor')
router.register(r'mentees', MenteeViewSet, basename='mentee')
router.register(r'halaqah', HalaqahViewSet, basename='halaqah')
router.register(r'jadwal', JadwalViewSet, basename='jadwal')
router.register(r'jurnal', JurnalPertemuanViewSet, basename='jurnal')
router.register(r'presensi', PresensiViewSet, basename='presensi')
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'mutabaahs', MutabaahViewSet, basename='mutabaah')
router.register(r'informasi', InformasiKegiatanViewSet, basename='informasi')
router.register(r'sertifikat', SertifikatViewSet, basename='sertifikat')

urlpatterns = [
    # Router utama
    path('', include(router.urls)),
    
    # Endpoint khusus untuk KMF menambah user via form manual
    path('kmf/tambah-user/', TambahUserKMFView.as_view(), name='kmf-tambah-user'),
    
    # 👇 Langsung panggil nama fungsinya, tanpa "views." 👇
    path('dashboard/kmf-summary/', dashboard_summary, name='dashboard-summary'),
]