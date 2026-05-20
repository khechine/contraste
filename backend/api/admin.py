"""
Django Admin configuration for Contraste Éditions.
Super-admin interface with rich customization.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Author, Book, News, HeroSection, Press


# ─────────────────────────────────────────────────────────────────
# Author Admin
# ─────────────────────────────────────────────────────────────────
@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['photo_preview', 'name', 'name_en', 'country', 'is_author_of_month', 'books_count', 'updated_at']
    list_display_links = ['name']
    list_filter = ['is_author_of_month', 'country']
    search_fields = ['name', 'name_en', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_author_of_month']
    ordering = ['name']
    readonly_fields = ['photo_preview_large', 'created_at', 'updated_at', 'books_count']

    fieldsets = (
        ('Identité', {
            'fields': ('name', 'name_en', 'slug', 'country', 'is_author_of_month')
        }),
        ('Photo', {
            'fields': ('photo', 'photo_preview_large')
        }),
        ('Biographie', {
            'fields': ('bio_fr', 'bio_en', 'bio_ar'),
            'classes': ('wide',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'books_count'),
            'classes': ('collapse',)
        }),
    )

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="40" height="50" style="object-fit:cover;border-radius:6px;" />', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Photo'

    def photo_preview_large(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="120" style="border-radius:8px;margin-top:8px;" />', obj.photo.url)
        return '—'
    photo_preview_large.short_description = 'Aperçu photo'

    def books_count(self, obj):
        return obj.books.count()
    books_count.short_description = 'Nombre de livres'


# ─────────────────────────────────────────────────────────────────
# Book Admin
# ─────────────────────────────────────────────────────────────────
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['cover_preview', 'title', 'author_display', 'category', 'price_dt', 'price_eur', 'year', 'is_featured', 'updated_at']
    list_display_links = ['title']
    list_filter = ['is_featured', 'category', 'language', 'year']
    search_fields = ['title', 'title_en', 'title_ar', 'author_name', 'isbn', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_featured', 'price_dt', 'price_eur']
    ordering = ['-id']
    readonly_fields = ['cover_preview_large', 'created_at', 'updated_at']
    autocomplete_fields = ['author']

    fieldsets = (
        ('Titres', {
            'fields': ('title', 'title_en', 'title_ar', 'slug')
        }),
        ('Auteur', {
            'fields': ('author', 'author_name')
        }),
        ('Couverture', {
            'fields': ('cover', 'cover_preview_large')
        }),
        ('Descriptions', {
            'fields': ('description', 'description_en', 'description_ar'),
            'classes': ('wide',)
        }),
        ('Prix & Détails', {
            'fields': ('price_dt', 'price_eur', 'year', 'pages', 'isbn', 'language', 'category', 'is_featured')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def cover_preview(self, obj):
        if obj.cover:
            return format_html('<img src="{}" width="35" height="50" style="object-fit:cover;border-radius:4px;" />', obj.cover.url)
        return '—'
    cover_preview.short_description = 'Couv.'

    def cover_preview_large(self, obj):
        if obj.cover:
            return format_html('<img src="{}" width="100" style="border-radius:8px;margin-top:8px;" />', obj.cover.url)
        return '—'
    cover_preview_large.short_description = 'Aperçu couverture'

    def author_display(self, obj):
        if obj.author:
            return obj.author.name
        return obj.author_name or '—'
    author_display.short_description = 'Auteur'


# ─────────────────────────────────────────────────────────────────
# News Admin
# ─────────────────────────────────────────────────────────────────
@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'title', 'author', 'date', 'updated_at']
    list_display_links = ['title']
    list_filter = ['date']
    search_fields = ['title', 'title_en', 'title_ar', 'slug', 'author']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-date', '-id']
    readonly_fields = ['image_preview_large', 'created_at', 'updated_at']

    fieldsets = (
        ('Titres', {
            'fields': ('title', 'title_en', 'title_ar', 'slug')
        }),
        ('Image & Date', {
            'fields': ('image', 'image_preview_large', 'date', 'author')
        }),
        ('Contenu', {
            'fields': ('content_fr', 'content_en', 'content_ar'),
            'classes': ('wide',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="40" style="object-fit:cover;border-radius:6px;" />', obj.image.url)
        return '—'
    image_preview.short_description = 'Image'

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="200" style="border-radius:8px;margin-top:8px;" />', obj.image.url)
        return '—'
    image_preview_large.short_description = 'Aperçu image'


# ─────────────────────────────────────────────────────────────────
# Hero Section Admin
# ─────────────────────────────────────────────────────────────────
@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'title', 'type', 'order', 'author_of_month', 'updated_at']
    list_display_links = ['title']
    list_filter = ['type']
    list_editable = ['order']
    ordering = ['order']
    readonly_fields = ['image_preview_large', 'created_at', 'updated_at']

    fieldsets = (
        ('Titres', {
            'fields': ('title', 'title_en', 'title_ar')
        }),
        ('Sous-titres', {
            'fields': ('subtitle', 'subtitle_en', 'subtitle_ar')
        }),
        ('Descriptions', {
            'fields': ('description', 'description_en', 'description_ar'),
            'classes': ('wide',)
        }),
        ('Bouton d\'action', {
            'fields': ('cta_label', 'cta_label_en', 'cta_label_ar', 'cta_url')
        }),
        ('Paramètres', {
            'fields': ('image', 'image_preview_large', 'type', 'order', 'author_of_month')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="45" style="object-fit:cover;border-radius:6px;" />', obj.image.url)
        return '—'
    image_preview.short_description = 'Image'

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="300" style="border-radius:8px;margin-top:8px;" />', obj.image.url)
        return '—'
    image_preview_large.short_description = 'Aperçu image'


# ─────────────────────────────────────────────────────────────────
# Press Admin
# ─────────────────────────────────────────────────────────────────
@admin.register(Press)
class PressAdmin(admin.ModelAdmin):
    list_display = ['logo_preview', 'title', 'media_name', 'publication_date', 'featured', 'article_link']
    list_display_links = ['title']
    list_filter = ['featured', 'publication_date']
    search_fields = ['title', 'media_name']
    list_editable = ['featured']
    ordering = ['-publication_date']
    readonly_fields = ['logo_preview_large', 'created_at', 'updated_at']

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" height="30" style="object-fit:contain;border-radius:4px;" />', obj.logo.url)
        return '—'
    logo_preview.short_description = 'Logo'

    def logo_preview_large(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="150" style="border-radius:8px;margin-top:8px;" />', obj.logo.url)
        return '—'
    logo_preview_large.short_description = 'Aperçu logo'

    def article_link(self, obj):
        if obj.article_url:
            return format_html('<a href="{}" target="_blank">🔗 Voir</a>', obj.article_url)
        return '—'
    article_link.short_description = 'Article'
