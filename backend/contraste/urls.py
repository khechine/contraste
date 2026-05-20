"""
URL configuration for Contraste backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import CustomTokenObtainPairView, UserMeView, LogoutView

urlpatterns = [
    # Django super-admin
    path(settings.ADMIN_URL, admin.site.urls),

    # ── Auth JWT ────────────────────────────────
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserMeView.as_view(), name='user_me'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),

    # ── REST API v1 ─────────────────────────────
    path('api/v1/', include('api.urls')),
]

# Serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize Django admin
admin.site.site_header = 'Contraste Éditions – Super Admin'
admin.site.site_title = 'Contraste Admin'
admin.site.index_title = 'Gestion du contenu'
