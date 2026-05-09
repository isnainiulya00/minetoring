from django.contrib import admin
from .models import Sertifikat, User, Koordinator, Mentor, Mentee, Halaqah, Jadwal, Presensi, Resume, Hafalan

# Daftarkan semua tabel ke halaman admin
admin.site.register(User)
admin.site.register(Koordinator)
admin.site.register(Mentor)
admin.site.register(Mentee)
admin.site.register(Halaqah)
admin.site.register(Jadwal)
admin.site.register(Presensi)
admin.site.register(Resume)
admin.site.register(Hafalan)
admin.site.register(Sertifikat)