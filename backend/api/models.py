"""
Models for Contraste Éditions CMS.
Mirrors the Directus schema: authors, books, news, hero_sections, press.
"""
import os
from django.db import models
from django.utils.text import slugify


def author_photo_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'authors/{instance.slug or "unknown"}.{ext}'


def book_cover_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'books/covers/{instance.slug or "unknown"}.{ext}'


def news_image_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'news/{instance.slug or "unknown"}.{ext}'


def hero_image_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'hero/{instance.order}_{instance.type or "section"}.{ext}'


def press_logo_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'press/logos/{instance.id or "unknown"}.{ext}'


def press_file_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'press/files/{instance.id or "unknown"}.{ext}'


# ─────────────────────────────────────────────────────────────────
# Author
# ─────────────────────────────────────────────────────────────────
class Author(models.Model):
    name = models.CharField(max_length=255, verbose_name='Nom (FR)')
    name_en = models.CharField(max_length=255, blank=True, default='', verbose_name='Nom (EN)')
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    bio_fr = models.TextField(blank=True, default='', verbose_name='Biographie (FR)')
    bio_en = models.TextField(blank=True, default='', verbose_name='Biographie (EN)')
    bio_ar = models.TextField(blank=True, default='', verbose_name='Biographie (AR)')
    photo = models.ImageField(upload_to=author_photo_path, null=True, blank=True, verbose_name='Photo')
    country = models.CharField(max_length=100, blank=True, default='', verbose_name='Pays')
    is_author_of_month = models.BooleanField(default=False, verbose_name="Auteur du mois")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Auteur'
        verbose_name_plural = 'Auteurs'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────────────────────────
# Book
# ─────────────────────────────────────────────────────────────────
LANGUAGE_CHOICES = [
    ('fr', 'Français'),
    ('ar', 'Arabe'),
    ('en', 'Anglais'),
    ('bi', 'Bilingue'),
]

class Book(models.Model):
    title = models.CharField(max_length=500, verbose_name='Titre (FR)')
    title_en = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (EN)')
    title_ar = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (AR)')
    slug = models.SlugField(max_length=500, unique=True, blank=True)

    author = models.ForeignKey(
        Author, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='books', verbose_name='Auteur'
    )
    author_name = models.CharField(max_length=255, blank=True, default='', verbose_name='Nom auteur (libre)')

    description = models.TextField(blank=True, default='', verbose_name='Description (FR)')
    description_en = models.TextField(blank=True, default='', verbose_name='Description (EN)')
    description_ar = models.TextField(blank=True, default='', verbose_name='Description (AR)')

    cover = models.ImageField(upload_to=book_cover_path, null=True, blank=True, verbose_name='Couverture')

    price_dt = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Prix (DT)')
    price_eur = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Prix (EUR)')

    year = models.IntegerField(null=True, blank=True, verbose_name='Année')
    pages = models.IntegerField(null=True, blank=True, verbose_name='Pages')
    isbn = models.CharField(max_length=50, blank=True, default='', verbose_name='ISBN')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, blank=True, default='fr', verbose_name='Langue')
    category = models.CharField(max_length=100, blank=True, default='', verbose_name='Catégorie')
    is_featured = models.BooleanField(default=False, verbose_name='Mis en avant')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Livre'
        verbose_name_plural = 'Livres'
        ordering = ['-id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────
# News
# ─────────────────────────────────────────────────────────────────
class News(models.Model):
    title = models.CharField(max_length=500, verbose_name='Titre (FR)')
    title_en = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (EN)')
    title_ar = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (AR)')
    slug = models.SlugField(max_length=500, unique=True, blank=True)

    content_fr = models.TextField(blank=True, default='', verbose_name='Contenu (FR)')
    content_en = models.TextField(blank=True, default='', verbose_name='Contenu (EN)')
    content_ar = models.TextField(blank=True, default='', verbose_name='Contenu (AR)')

    image = models.ImageField(upload_to=news_image_path, null=True, blank=True, verbose_name='Image')
    date = models.DateTimeField(null=True, blank=True, verbose_name='Date de publication')
    author = models.CharField(max_length=255, blank=True, default='', verbose_name='Auteur (texte libre)')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Actualité'
        verbose_name_plural = 'Actualités'
        ordering = ['-date', '-id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────
# Hero Section
# ─────────────────────────────────────────────────────────────────
HERO_TYPE_CHOICES = [
    ('main', 'Principal'),
    ('secondary', 'Secondaire'),
    ('author', 'Auteur du mois'),
    ('promo', 'Promotion'),
    ('latest', 'Dernières parutions'),
    ('news', 'Actualités'),
]

class HeroSection(models.Model):
    title = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (FR)')
    title_en = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (EN)')
    title_ar = models.CharField(max_length=500, blank=True, default='', verbose_name='Titre (AR)')

    subtitle = models.CharField(max_length=500, blank=True, default='', verbose_name='Sous-titre (FR)')
    subtitle_en = models.CharField(max_length=500, blank=True, default='', verbose_name='Sous-titre (EN)')
    subtitle_ar = models.CharField(max_length=500, blank=True, default='', verbose_name='Sous-titre (AR)')

    description = models.TextField(blank=True, default='', verbose_name='Description (FR)')
    description_en = models.TextField(blank=True, default='', verbose_name='Description (EN)')
    description_ar = models.TextField(blank=True, default='', verbose_name='Description (AR)')

    cta_label = models.CharField(max_length=200, blank=True, default='', verbose_name='Bouton (FR)')
    cta_label_en = models.CharField(max_length=200, blank=True, default='', verbose_name='Bouton (EN)')
    cta_label_ar = models.CharField(max_length=200, blank=True, default='', verbose_name='Bouton (AR)')
    cta_url = models.CharField(max_length=500, blank=True, default='', verbose_name='URL du bouton')

    image = models.ImageField(upload_to=hero_image_path, null=True, blank=True, verbose_name='Image')
    type = models.CharField(max_length=50, choices=HERO_TYPE_CHOICES, default='main', verbose_name='Type')
    order = models.IntegerField(default=0, verbose_name='Ordre d\'affichage')

    author_of_month = models.ForeignKey(
        Author, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='hero_sections', verbose_name='Auteur du mois lié'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Section Hero'
        verbose_name_plural = 'Sections Hero'
        ordering = ['order']

    def __str__(self):
        return f"[{self.type}] {self.title or 'Sans titre'} (#{self.order})"


# ─────────────────────────────────────────────────────────────────
# Press
# ─────────────────────────────────────────────────────────────────
class Press(models.Model):
    title = models.CharField(max_length=500, verbose_name='Titre de l\'article')
    media_name = models.CharField(max_length=255, verbose_name='Nom du média')
    publication_date = models.DateField(null=True, blank=True, verbose_name='Date de publication')
    excerpt = models.TextField(blank=True, default='', verbose_name='Extrait')
    article_url = models.URLField(blank=True, default='', verbose_name='URL de l\'article')
    logo = models.ImageField(upload_to=press_logo_path, null=True, blank=True, verbose_name='Logo du média')
    featured = models.BooleanField(default=False, verbose_name='À la une')
    file_attachment = models.FileField(upload_to=press_file_path, null=True, blank=True, verbose_name='Fichier joint')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Article de presse'
        verbose_name_plural = 'Articles de presse'
        ordering = ['-publication_date']

    def __str__(self):
        return f"{self.media_name} — {self.title}"
