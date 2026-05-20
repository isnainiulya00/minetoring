from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Hafalan, Halaqah, Jadwal, Koordinator, MateriMentoring, Mentee, Mentor,
    Presensi, Resume, Sertifikat, User,
)

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {
            'fields': ('role', 'foto', 'no_hp'),
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {
            'fields': ('role',),
        }),
    )
# Daftarkan semua tabel ke halaman admin
admin.site.register(User, CustomUserAdmin)
admin.site.register(Koordinator)
admin.site.register(Mentor)
admin.site.register(Mentee)
admin.site.register(Halaqah)
admin.site.register(Jadwal)
admin.site.register(Presensi)
admin.site.register(Resume)
admin.site.register(Hafalan)
admin.site.register(Sertifikat)
admin.site.register(MateriMentoring)