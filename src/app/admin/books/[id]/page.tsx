'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';

export default function BookEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [book, setBook] = useState<any>({
    title: '',
    title_en: '',
    title_ar: '',
    slug: '',
    author_name: '',
    author: null,
    description: '',
    description_en: '',
    description_ar: '',
    price_dt: '',
    price_eur: '',
    pages: '',
    year: '',
    category: '',
    language: '',
    is_featured: false,
    cover_image: null
  });
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all authors for the dropdown
        const authorsRes = await adminDirectus.request(() => ({
          path: '/items/authors',
          method: 'GET',
          params: { sort: 'name', fields: 'id,name' }
        })) as any;
        setAuthors(authorsRes.data);

        if (!isNew) {
          const bookRes = await adminDirectus.request(() => ({
            path: `/items/books/${id}`,
            method: 'GET'
          })) as any;
          setBook(bookRes.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch book data:', err);
        setError("Une erreur est survénue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...book };
      // Convert numeric strings back to numbers
      payload.price_dt = payload.price_dt ? parseFloat(payload.price_dt) : null;
      payload.price_eur = payload.price_eur ? parseFloat(payload.price_eur) : null;
      payload.pages = payload.pages ? parseInt(payload.pages) : null;
      payload.year = payload.year ? parseInt(payload.year) : null;

      if (isNew) {
        await adminDirectus.request(() => ({
          path: '/items/books',
          method: 'POST',
          body: JSON.stringify(payload)
        }));
      } else {
        await adminDirectus.request(() => ({
          path: `/items/books/${id}`,
          method: 'PATCH',
          body: JSON.stringify(payload)
        }));
      }
      router.push('/admin/books');
    } catch (err: any) {
      console.error('Failed to save book:', err);
      setError('Erreur lors de l’enregistrement. Vérifiez que le slug est unique.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setBook((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as any).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/books" className="text-teal-600 font-bold flex items-center gap-2 mb-2 hover:translate-x-[-4px] transition-transform">
            ← Catalogue de livres
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Ajouter un livre' : `Modifier ${book?.title || ''}`}
          </h1>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Info */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-gray-800">Informations Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Titre (Français) 🇫🇷</label>
              <input
                type="text"
                name="title"
                required
                value={book?.title || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={book.slug || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Titre (Anglais) 🇬🇧</label>
              <input
                type="text"
                name="title_en"
                value={book?.title_en || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Titre (Arabe) 🇹🇳</label>
              <input
                type="text"
                name="title_ar"
                value={book?.title_ar || ''}
                onChange={handleChange}
                dir="rtl"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Auteur</label>
              <select
                name="author"
                value={book.author || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium appearance-none"
              >
                <option value="">Sélectionner un auteur...</option>
                {authors.map((author: any) => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Nom de l'auteur (Texte affiché)</label>
              <input
                type="text"
                name="author_name"
                value={book.author_name || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Categories and Prices */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Catégorie</label>
              <input
                type="text"
                name="category"
                value={book.category || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                placeholder="Ex: Roman"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Prix (DT)</label>
              <input
                type="number"
                step="0.001"
                name="price_dt"
                value={book.price_dt || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Prix (EUR)</label>
              <input
                type="number"
                step="0.01"
                name="price_eur"
                value={book.price_eur || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Pages</label>
              <input
                type="number"
                name="pages"
                value={book.pages || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Année</label>
              <input
                type="number"
                name="year"
                value={book.year || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Langue</label>
              <input
                type="text"
                name="language"
                value={book.language || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="flex items-center pt-8 px-4">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={book.is_featured || false}
                onChange={handleChange}
                className="w-6 h-6 text-teal-600 bg-gray-100 border-gray-200 rounded-lg focus:ring-teal-500 focus:ring-offset-0"
              />
              <label htmlFor="is_featured" className="ml-3 text-sm font-bold text-gray-700 select-none cursor-pointer">
                Livre Vedette ⭐
              </label>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-gray-800">Résumés & Descriptions</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Description (Français) 🇫🇷</label>
              <textarea
                name="description"
                rows={8}
                value={book.description || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Description (Anglais) 🇬🇧</label>
              <textarea
                name="description_en"
                rows={8}
                value={book.description_en || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1 text-right block">Description (Arabe) 🇹🇳</label>
              <textarea
                name="description_ar"
                rows={8}
                value={book.description_ar || ''}
                onChange={handleChange}
                dir="rtl"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-20">
          <Link 
            href="/admin/books"
            className="px-8 py-4 bg-white text-gray-500 font-bold rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isNew ? 'Créer le livre' : 'Enregistrer les modifications')}
          </button>
        </div>
      </form>
    </div>
  );
}
