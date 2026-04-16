'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

export default function AuthorEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [author, setAuthor] = useState<any>({
    name: '',
    slug: '',
    bio_fr: '',
    bio_en: '',
    bio_ar: '',
    photo: null,
    country: '',
    is_author_of_month: false
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;

    async function fetchAuthor() {
      try {
        const response = await adminDirectus.request(() => ({
          path: `/items/authors/${id}`,
          method: 'GET'
        })) as any;
        setAuthor(response.data);
      } catch (err: any) {
        console.error('Failed to fetch author:', err);
        setError("Impossible de charger l'auteur.");
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [id, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...author };
      // Ensure we explicitly map bio_fr if it was renamed in state
      if (isNew) {
        await adminDirectus.request(() => ({
          path: '/items/authors',
          method: 'POST',
          body: JSON.stringify(payload)
        }));
      } else {
        await adminDirectus.request(() => ({
          path: `/items/authors/${id}`,
          method: 'PATCH',
          body: JSON.stringify(payload)
        }));
      }
      router.push('/admin/authors');
    } catch (err: any) {
      console.error('Failed to save author:', err);
      setError('Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    setAuthor((prev: any) => {
      const updates: any = {
        [name]: type === 'checkbox' ? (e.target as any).checked : value
      };

      // Auto-slug from name if empty
      if (name === 'name' && !prev.slug) {
        updates.slug = slugify(value);
      }

      return { ...prev, ...updates };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/authors" className="text-teal-600 font-bold flex items-center gap-2 mb-2 hover:translate-x-[-4px] transition-transform">
            ← Paramètres des auteurs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Créer un nouvel auteur' : `Modifier ${author.name}`}
          </h1>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Nom complet</label>
              <input
                type="text"
                name="name"
                required
                value={author.name}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                placeholder="Ex: Houbeb Khechine"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={author.slug}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium font-mono"
                placeholder="ex-houbeb-khechine"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Pays / Origine</label>
              <input
                type="text"
                name="country"
                value={author.country || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                placeholder="Ex: Tunisie"
              />
            </div>
            <div className="flex items-center pt-8 px-4">
              <input
                type="checkbox"
                id="is_author_of_month"
                name="is_author_of_month"
                checked={author.is_author_of_month || false}
                onChange={handleChange}
                className="w-6 h-6 text-teal-600 bg-gray-100 border-gray-200 rounded-lg focus:ring-teal-500 focus:ring-offset-0"
              />
              <label htmlFor="is_author_of_month" className="ml-3 text-sm font-bold text-gray-700 select-none cursor-pointer">
                Auteur du mois ⭐
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-gray-800">Biographies (Multilingue)</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
                🇫🇷 Biographie (Français)
              </label>
              <textarea
                name="bio_fr"
                rows={6}
                value={author.bio_fr || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
                🇬🇧 Biographie (Anglais)
              </label>
              <textarea
                name="bio_en"
                rows={6}
                value={author.bio_en || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
                🇹🇳 Biographie (Arabe)
              </label>
              <textarea
                name="bio_ar"
                rows={6}
                value={author.bio_ar || ''}
                onChange={handleChange}
                dir="rtl"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-10">
          <Link 
            href="/admin/authors"
            className="px-8 py-4 bg-white text-gray-500 font-bold rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isNew ? 'Créer l’auteur' : 'Enregistrer les modifications')}
          </button>
        </div>
      </form>
    </div>
  );
}
