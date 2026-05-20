from rest_framework import permissions


def role(user):
    return getattr(user, 'role', None) if user and user.is_authenticated else None


class IsAuthenticatedRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsKMFWrite(permissions.BasePermission):
    """KMF: full write on master data. Others: read-only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) == 'KMF'


class IsJadwalWrite(permissions.BasePermission):
    """KMF: full CRUD jadwal. Mentor: PATCH laporan/kehadiran only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        r = role(request.user)
        if r == 'KMF':
            return True
        if r == 'MENTOR' and request.method in ('PATCH', 'PUT'):
            return True
        return False


class IsAdminSertifikatWrite(permissions.BasePermission):
    """ADMIN: CRUD sertifikat. KMF & others: read-only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) == 'ADMIN'


class IsMentorPresensiWrite(permissions.BasePermission):
    """Only MENTOR can create/update/delete presensi."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) == 'MENTOR'


class IsMentorHafalanWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) == 'MENTOR'


class IsKMFMateriWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) == 'KMF'


class IsResumePermission(permissions.BasePermission):
    """MENTEE: CRUD own resume file. MENTOR: grade only. Others: read."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return role(request.user) in ('MENTEE', 'MENTOR')


class IsOwnProfileOrKMF(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if role(request.user) == 'KMF':
            return True
        return obj.id == request.user.id
