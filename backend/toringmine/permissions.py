from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Aturan: 
    - Kalau cuma mau baca data (GET), semua orang yang punya ID Card diizinkan.
    - Kalau mau nambah/hapus data (POST/DELETE), HANYA Admin/Koordinator yang boleh.
    """
    def has_permission(self, request, view):
        # SAFE_METHODS itu adalah metode yang cuma "membaca" (seperti GET)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Selain GET (berarti dia mencoba POST, PUT, atau DELETE), 
        # kita cek apakah dia adalah is_staff (Superuser/Koordinator)
        return bool(request.user and request.user.is_staff)
    
class IsMentorCanEditMenteeReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # 1. Semua yang login bisa melihat (GET)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 2. Cek apakah user adalah Admin atau Mentor
        # (Asumsinya Mentor adalah staf atau punya profil mentor)
        is_staff = request.user.is_staff
        is_mentor = hasattr(request.user, 'mentor_user') # Sesuai related_name di models.py
        
        if is_staff or is_mentor:
            return True
            
        # 3. Mentee (user biasa) ditolak jika mencoba POST/PUT/DELETE
        return False