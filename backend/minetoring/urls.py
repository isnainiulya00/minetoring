from django.contrib import admin
from django.urls import path, include
# Impor mesin pencetak tiket JWT-nya
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('toringmine.urls')), 
    
    # Loket khusus untuk mencetak tiket JWT (Login)
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Loket khusus untuk memperpanjang masa aktif tiket
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]