'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminGet, adminCreate, adminUpdate, adminList } from '@/lib/admin-django';
import Link from 'next/link';

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'bi', label: 'Bilingue' },
];

export default function BookEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<any[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    title_ar: '',
    slug: '',
    author: '',
    author_name: '',
    description: '',
    description_en: '',
    description_ar: '',
    price_dt: '',
    price_eur: '',
    year: '',
    pages: '',
    isbn: '',
    language: 'fr',
    category: '',
    is_featured: false,
  });

  useEffect(() => {
    adminList('authors', { ordering: 'name', limit: '500' }).then((data) => {
      setAuthors(Array.isArray(data) ? data : []);
    });

    if (!isNew) {
      adminGet('books', id)
        .then((data) => {
          setForm({
            title: data.title || '',
            title_en: data.title_en || '',
            title_ar: data.title_ar || '',
            slug: data.slug || '',
            author: data.author ? String(data.author) : '',
            author_name: data.author_name || '',
            description: data.description || '',
            description_en: data.description_en || '',
            description_ar: data.description_ar || '',
            price_dt: data.price_dt ? String(data.price_dt) : '',
            price_eur: data.price_eur ? String(data.price_eur) : '',
            year: data.year ? String(data.year) : '',
            pages: data.pages ? String(data.pages) : '',
            isbn: data.isbn || '',
            language: data.language || 'fr',
            category: data.category || '',
            is_featured: data.is_featured || false,
          });
          if (data.cover_url) setCoverPreview(data.cover_url);
        })
        .catch(() => router.push('/admin/books'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      if (isNew) {
        await adminCreate('books', formData);
      } else {
        await adminUpdate('books', id, formData);
      }

      router.push('/admin/books');
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/books" className="text-gray-400 hover:text-teal-600 font-medium text-sm mb-2 inline-flex items-center gap-1 transition-colors">
            ← Retour aux livres
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Nouveau livre' : `Modifier : ${form.title || '...'}`}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cover + Titres */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover upload */}
          <div className="lg:col-span-1">
            <div
              className="aspect-[3/4] bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all overflow-hidden relative group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Couverture" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📸 Changer la couverture</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3 text-gray-300">📷</div>
                  <p className="text-gray-400 font-medium text-sm text-center px-4">
                    Cliquer pour ajouter une couverture
                  </p>
                  <p className="text-gray-300 text-xs mt-1">JPG, PNG, WebP</p>
                </>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Titres */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Titres</h3>
              {[
                { name: 'title', label: 'Titre (Français) *', required: true },
                { name: 'title_en', label: 'Titre (English)' },
                { name: 'title_ar', label: 'العنوان (عربي)', dir: 'rtl' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    dir={field.dir}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Slug (URL)</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Généré automatiquement si vide"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auteur + Infos */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Auteur & Informations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Auteur (de la base)</label>
              <select
                name="author"
                value={form.author}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              >
                <option value="">— Sélectionner un auteur —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Nom auteur (texte libre)</label>
              <input
                type="text"
                name="author_name"
                value={form.author_name}
                onChange={handleChange}
                placeholder="Si l'auteur n'est pas dans la base"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Prix (DT)</label>
              <input
                type="number"
                name="price_dt"
                value={form.price_dt}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Prix (EUR)</label>
              <input
                type="number"
                name="price_eur"
                value={form.price_eur}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Année</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                min="1900"
                max="2030"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Pages</label>
              <input
                type="number"
                name="pages"
                value={form.pages}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">ISBN</label>
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Langue</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Catégorie</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Roman, Poésie, Essai..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700"
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                ⭐ Mettre en avant sur la page d&apos;accueil
              </label>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Descriptions</h3>
          {[
            { name: 'description', label: 'Description (Français)' },
            { name: 'description_en', label: 'Description (English)' },
            { name: 'description_ar', label: 'الوصف (عربي)', dir: 'rtl' },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-gray-600 block mb-1">{field.label}</label>
              <textarea
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                dir={field.dir}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</>
            ) : (
              <>{isNew ? '➕ Créer le livre' : '💾 Sauvegarder les modifications'}</>
            )}
          </button>
          <Link href="/admin/books" className="text-gray-400 hover:text-gray-600 font-medium transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
