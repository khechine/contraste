"""
DRF Serializers for Contraste API.
"""
from django.conf import settings
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Author, Book, News, HeroSection, Press


def absolute_url(request, path):
    """Build absolute URL for media files using public SITE_URL to avoid leaking internal hostnames."""
    if not path:
        return None
    if str(path).startswith(('http://', 'https://')):
        return str(path)
    # Use explicit SITE_URL env var (public domain) to prevent backend:8000 leaking
    site_url = getattr(settings, 'SITE_URL', None)
    if site_url:
        return f'{site_url.rstrip("/")}/media/{path}'
    if request:
        return request.build_absolute_uri(f'/media/{path}')
    base = settings.MEDIA_URL
    return f'{base}{path}'


# ─────────────────────────────────────────────────────────────────
# Author
# ─────────────────────────────────────────────────────────────────
class AuthorListSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = ['id', 'name', 'name_en', 'slug', 'country',
                  'is_author_of_month', 'photo_url']

    def get_photo_url(self, obj):
        return absolute_url(self.context.get('request'), obj.photo) if obj.photo else None


class AuthorDetailSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Author
        fields = '__all__'

    def get_photo_url(self, obj):
        return absolute_url(self.context.get('request'), obj.photo) if obj.photo else None


# ─────────────────────────────────────────────────────────────────
# Book
# ─────────────────────────────────────────────────────────────────
class BookListSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    author_name_display = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'title_en', 'title_ar', 'slug',
                  'author_id', 'author_name_display', 'category',
                  'price_dt', 'price_eur', 'is_featured',
                  'year', 'language', 'cover_url']

    def get_cover_url(self, obj):
        return absolute_url(self.context.get('request'), obj.cover) if obj.cover else None

    def get_author_name_display(self, obj):
        if obj.author:
            return obj.author.name
        return obj.author_name


class BookDetailSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    cover = serializers.ImageField(required=False, allow_null=True)
    author_detail = AuthorListSerializer(source='author', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'

    def get_cover_url(self, obj):
        return absolute_url(self.context.get('request'), obj.cover) if obj.cover else None


# ─────────────────────────────────────────────────────────────────
# News
# ─────────────────────────────────────────────────────────────────
class NewsListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['id', 'title', 'title_en', 'title_ar', 'slug',
                  'excerpt', 'image_url', 'date', 'author']

    def get_image_url(self, obj):
        return absolute_url(self.context.get('request'), obj.image) if obj.image else None

    def get_excerpt(self, obj):
        return (obj.content_fr or '')[:200]


class NewsDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = News
        fields = '__all__'

    def get_image_url(self, obj):
        return absolute_url(self.context.get('request'), obj.image) if obj.image else None


# ─────────────────────────────────────────────────────────────────
# Hero Section
# ─────────────────────────────────────────────────────────────────
class HeroSectionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    author_of_month_detail = AuthorListSerializer(source='author_of_month', read_only=True)

    class Meta:
        model = HeroSection
        fields = '__all__'

    def get_image_url(self, obj):
        return absolute_url(self.context.get('request'), obj.image) if obj.image else None


# ─────────────────────────────────────────────────────────────────
# Press
# ─────────────────────────────────────────────────────────────────
class PressSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    logo = serializers.ImageField(required=False, allow_null=True)
    file_attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Press
        fields = '__all__'

    def get_logo_url(self, obj):
        return absolute_url(self.context.get('request'), obj.logo) if obj.logo else None

    def get_file_attachment_url(self, obj):
        return absolute_url(self.context.get('request'), obj.file_attachment) if obj.file_attachment else None


# ─────────────────────────────────────────────────────────────────
# Custom JWT
# ─────────────────────────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        return data
