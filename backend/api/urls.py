"""
URL routing for the Contraste API v1.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthorViewSet, BookViewSet, NewsViewSet,
    HeroSectionViewSet, PressViewSet,
    MediaUploadView, StatsView,
)

router = DefaultRouter()
router.register(r'authors', AuthorViewSet, basename='author')
router.register(r'books', BookViewSet, basename='book')
router.register(r'news', NewsViewSet, basename='news')
router.register(r'hero-sections', HeroSectionViewSet, basename='hero-section')
router.register(r'press', PressViewSet, basename='press')

urlpatterns = [
    path('', include(router.urls)),
    path('media/', MediaUploadView.as_view(), name='media-upload'),
    path('stats/', StatsView.as_view(), name='stats'),
]
