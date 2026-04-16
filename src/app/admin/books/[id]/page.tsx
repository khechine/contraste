'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import { slugify } from '@/lib/utils';
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
    cover: null
  });
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const APP_CATEGORIES = [
    'Roman',
    'Essai',
    'Histoire',
    'Archéologie',
    'Poésie',
    'Soufisme',
    'Art',
    'Guide',
    'Photo',
    'Littérature',
    'Biographie'
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all authors for the dropdown
        const authorsRes = await adminDirectus.request(() => ({
          path: '/items/authors',
          method: 'GET',
          params: { sort: 'name', fields: 'id,name' }
        })) as any;
        setAuthors(authorsRes.data || authorsRes || []);

        if (!isNew) {
          const bookRes = await adminDirectus.request(() => ({
            path: `/items/books/${id}`,
            method: 'GET'
          })) as any;
          setBook(bookRes.data || {});
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
      
      // Ensure we don't send cover_image if it accidentally slipped into the object
      delete (payload as any).cover_image;

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
    
    setBook((prev: any) => {
      const updates: any = {
        [name]: type === 'checkbox' ? (e.target as any).checked : value
      };

      // Auto-slug from title if slug is empty or matches the previous auto-generated slug
      const currentSlug = prev?.slug || '';
      const currentTitle = prev?.title || '';
      if (name === 'title' && (!currentSlug || currentSlug === slugify(currentTitle))) {
        updates.slug = slugify(value);
      }

      // Sync author_name when selecting an author (Backward compatibility for single relation)
      if (name === 'author') {
        const selectedAuthor = authors.find(a => a.id === value);
        if (selectedAuthor) {
          updates.author_name = selectedAuthor.name;
        }
      }

      return { ...prev, ...updates };
    });
  };

  const toggleAuthor = (authorId: string) => {
    const selectedAuthor = authors.find(a => a.id === authorId);
    if (!selectedAuthor) return;

    setBook((prev: any) => {
      if (!prev) return prev;
      let currentNames = prev.author_name ? String(prev.author_name).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      
      if (currentNames.includes(selectedAuthor.name)) {
        currentNames = currentNames.filter((n: string) => n !== selectedAuthor.name);
      } else {
        currentNames.push(selectedAuthor.name);
      }

      const newAuthorName = currentNames.join(', ');
      
      // The relation (author_id) will store the first author in the list
      const firstAuthorName = currentNames[0];
      const firstAuthor = authors.find(a => a.name === firstAuthorName);
      
      return {
        ...prev,
        author_name: newAuthorName,
        author: firstAuthor ? firstAuthor.id : null
      };
    });
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
                value={book?.slug || ''}
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
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-500 ml-1">Sélectionner les auteurs</label>
              <select
                name="author_picker"
                value=""
                onChange={(e) => toggleAuthor(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium appearance-none"
              >
                <option value="">Ajouter un auteur...</option>
                {authors.map((author: any) => (
                  <option key={author.id} value={author.id}>
                    {book?.author_name?.includes(author.name) ? `✓ ${author.name}` : author.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-2">
                {book.author_name?.split(',').map((name: string) => name.trim()).filter(Boolean).map((name: string) => (
                  <button 
                    key={name}
                    type="button"
                    onClick={() => {
                      const a = authors.find(aut => aut.name === name);
                      if (a) toggleAuthor(a.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-100 font-bold text-sm hover:bg-teal-100 transition-colors"
                  >
                    {name} <span className="text-teal-300">✕</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Nom des auteurs (Affichage combiné)</label>
              <input
                type="text"
                name="author_name"
                readOnly
                value={book?.author_name || ''}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl focus:outline-none cursor-not-allowed font-medium text-gray-500"
                placeholder="Les auteurs sélectionnés apparaîtront ici"
              />
            </div>
          </div>
        </div>

        {/* Categories and Prices */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Catégorie</label>
              <select
                name="category"
                value={book?.category || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium appearance-none"
              >
                <option value="">Sélectionner une catégorie...</option>
                {APP_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Prix (DT)</label>
              <input
                type="number"
                step="0.001"
                name="price_dt"
                value={book?.price_dt || ''}
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
                value={book?.price_eur || ''}
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
                value={book?.pages || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Année</label>
              <input
                type="number"
                name="year"
                value={book?.year || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Langue</label>
              <input
                type="text"
                name="language"
                value={book?.language || ''}
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
                value={book?.description || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Description (Anglais) 🇬🇧</label>
              <textarea
                name="description_en"
                rows={8}
                value={book?.description_en || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1 text-right block">Description (Arabe) 🇹🇳</label>
              <textarea
                name="description_ar"
                rows={8}
                value={book?.description_ar || ''}
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
