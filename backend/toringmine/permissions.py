from rest_framework import permissions


def _role(user):
    return getattr(user, 'role', None)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) == 'ADMIN')


class IsKMFRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) == 'KMF')


class IsAdminOrKMF(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return _role(request.user) in ('ADMIN', 'KMF') or request.user.is_staff


class IsKMFOrReadOnly(permissions.BasePermission):
    """KMF full CRUD; others read-only when authenticated."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return _role(request.user) == 'KMF'


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return _role(request.user) in ('ADMIN', 'KMF') or request.user.is_staff


class IsMentorCanEditMenteeReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        role = _role(request.user)
        return role in ('ADMIN', 'KMF', 'MENTOR') or request.user.is_staff


class IsResumePermission(permissions.BasePermission):
    """KMF/Admin full write; Mentee can create/update own; Mentor read-only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        role = _role(request.user)
        return role in ('ADMIN', 'KMF', 'MENTEE')


class IsMentorPresensiOnly(permissions.BasePermission):
    """Mentor/KMF/Admin can write presensi; mentee read-only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return _role(request.user) in ('ADMIN', 'KMF', 'MENTOR') or request.user.is_staff
