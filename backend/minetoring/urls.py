from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from toringmine.serializers import CustomTokenObtainPairSerializer 


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('toringmine.urls')),
    
    # URL token bawaan (opsional, biarkan saja)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 👇 4. URL API Login sekarang dihubungkan ke CustomLoginView
    path('api/login/', CustomLoginView.as_view(), name='login'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)