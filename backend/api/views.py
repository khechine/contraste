"""
API Views for Contraste Éditions.
"""
import os
from django.contrib.auth.models import User
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings

from .models import Author, Book, News, HeroSection, Press
from .serializers import (
    AuthorListSerializer, AuthorDetailSerializer,
    BookListSerializer, BookDetailSerializer,
    NewsListSerializer, NewsDetailSerializer,
    HeroSectionSerializer, PressSerializer,
    CustomTokenObtainPairSerializer,
)


# ─────────────────────────────────────────────────────────────────
# Auth Views
# ─────────────────────────────────────────────────────────────────
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Déconnexion réussie.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Token invalide.'}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────
# Author ViewSet
# ─────────────────────────────────────────────────────────────────
class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_author_of_month', 'country']
    search_fields = ['name', 'name_en', 'slug']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return AuthorListSerializer
        return AuthorDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        try:
            author = Author.objects.get(slug=slug)
            serializer = AuthorDetailSerializer(author, context={'request': request})
            return Response(serializer.data)
        except Author.DoesNotExist:
            return Response({'detail': 'Auteur introuvable.'}, status=404)

    @action(detail=False, methods=['get'], url_path='author-of-month')
    def author_of_month(self, request):
        author = Author.objects.filter(is_author_of_month=True).first()
        if not author:
            author = Author.objects.order_by('-id').first()
        if not author:
            return Response(None)
        serializer = AuthorDetailSerializer(author, context={'request': request})
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────
# Book ViewSet
# ─────────────────────────────────────────────────────────────────
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_featured', 'category', 'language', 'author']
    search_fields = ['title', 'title_en', 'title_ar', 'author_name', 'slug', 'isbn']
    ordering_fields = ['title', 'price_dt', 'year', 'created_at', 'id']
    ordering = ['-id']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        try:
            book = Book.objects.select_related('author').get(slug=slug)
            serializer = BookDetailSerializer(book, context={'request': request})
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response({'detail': 'Livre introuvable.'}, status=404)

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        books = Book.objects.filter(is_featured=True).select_related('author')[:6]
        if not books.exists():
            books = Book.objects.select_related('author').order_by('-id')[:6]
        serializer = BookListSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        limit = int(request.query_params.get('limit', 6))
        books = Book.objects.select_related('author').order_by('-id')[:limit]
        serializer = BookListSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────
# News ViewSet
# ─────────────────────────────────────────────────────────────────
class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'title_en', 'title_ar', 'slug']
    ordering_fields = ['date', 'created_at', 'id']
    ordering = ['-date', '-id']

    def get_serializer_class(self):
        if self.action == 'list':
            return NewsListSerializer
        return NewsDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        try:
            news = News.objects.get(slug=slug)
            serializer = NewsDetailSerializer(news, context={'request': request})
            return Response(serializer.data)
        except News.DoesNotExist:
            return Response({'detail': 'Actualité introuvable.'}, status=404)


# ─────────────────────────────────────────────────────────────────
# HeroSection ViewSet
# ─────────────────────────────────────────────────────────────────
class HeroSectionViewSet(viewsets.ModelViewSet):
    queryset = HeroSection.objects.select_related('author_of_month').all()
    serializer_class = HeroSectionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type']
    ordering_fields = ['order']
    ordering = ['order']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# ─────────────────────────────────────────────────────────────────
# Press ViewSet
# ─────────────────────────────────────────────────────────────────
class PressViewSet(viewsets.ModelViewSet):
    queryset = Press.objects.all()
    serializer_class = PressSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['featured']
    search_fields = ['title', 'media_name']
    ordering_fields = ['publication_date', 'created_at']
    ordering = ['-publication_date']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# ─────────────────────────────────────────────────────────────────
# Media Upload View
# ─────────────────────────────────────────────────────────────────
class MediaUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'Aucun fichier fourni.'}, status=400)

        # Save to media/uploads/ folder
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        folder = request.data.get('folder', 'uploads')
        filename = f'{folder}/{file.name}'
        path = default_storage.save(filename, ContentFile(file.read()))
        url = request.build_absolute_uri(f'{settings.MEDIA_URL}{path}')

        return Response({
            'url': url,
            'path': path,
            'name': file.name,
            'size': file.size,
        }, status=201)

    def get(self, request):
        """List uploaded media files."""
        import os
        media_root = settings.MEDIA_ROOT
        files = []

        for dirpath, _, filenames in os.walk(media_root):
            for fname in filenames:
                full_path = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(full_path, media_root)
                url = request.build_absolute_uri(f'{settings.MEDIA_URL}{rel_path}')
                files.append({
                    'name': fname,
                    'path': rel_path,
                    'url': url,
                    'size': os.path.getsize(full_path),
                })

        files.sort(key=lambda x: x['name'])
        return Response({'count': len(files), 'results': files})


# ─────────────────────────────────────────────────────────────────
# Stats View
# ─────────────────────────────────────────────────────────────────
class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'books': Book.objects.count(),
            'authors': Author.objects.count(),
            'news': News.objects.count(),
            'press': Press.objects.count(),
            'hero_sections': HeroSection.objects.count(),
        })
