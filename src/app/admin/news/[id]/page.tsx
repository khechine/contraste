'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminDirectus } from '@/lib/admin-directus';
import Link from 'next/link';

export default function NewsEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [news, setNews] = useState<any>({
    title: '',
    title_en: '',
    title_ar: '',
    slug: '',
    content: '',
    content_en: '',
    content_ar: '',
    date: new Date().toISOString().split('T')[0],
    image: null
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;

    async function fetchNews() {
      try {
        const response = await adminDirectus.request(() => ({
          path: `/items/news/${id}`,
          method: 'GET'
        })) as any;
        setNews(response.data);
      } catch (err: any) {
        console.error('Failed to fetch news:', err);
        setError("Impossible de charger l'article.");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [id, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...news };
      if (isNew) {
        await adminDirectus.request(() => ({
          path: '/items/news',
          method: 'POST',
          body: JSON.stringify(payload)
        }));
      } else {
        await adminDirectus.request(() => ({
          path: `/items/news/${id}`,
          method: 'PATCH',
          body: JSON.stringify(payload)
        }));
      }
      router.push('/admin/news');
    } catch (err: any) {
      console.error('Failed to save news:', err);
      setError('Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNews((prev: any) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/news" className="text-teal-600 font-bold flex items-center gap-2 mb-2 hover:translate-x-[-4px] transition-transform">
            ← Toutes les actualités
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Créer un article' : `Modifier l'article`}
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
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Titre de l'article 🇫🇷</label>
              <input
                type="text"
                name="title"
                required
                value={news.title || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={news.slug || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-mono text-sm uppercase tracking-tighter"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Date de publication</label>
              <input
                type="date"
                name="date"
                value={news.date || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-gray-800">Contenu de l'article</h2>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Corps du texte (Français) 🇫🇷</label>
              <textarea
                name="content"
                rows={12}
                value={news.content || ''}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Titre (Anglais) 🇬🇧</label>
                <input
                  type="text"
                  name="title_en"
                  value={news.title_en || ''}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1 text-right block">Titre (Arabe) 🇹🇳</label>
                <input
                  type="text"
                  name="title_ar"
                  value={news.title_ar || ''}
                  onChange={handleChange}
                  dir="rtl"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Contenu (Arabe) 🇹🇳</label>
              <textarea
                name="content_ar"
                rows={10}
                value={news.content_ar || ''}
                onChange={handleChange}
                dir="rtl"
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium leading-relaxed text-gray-700 shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-10">
          <Link 
            href="/admin/news"
            className="px-8 py-4 bg-white text-gray-500 font-bold rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isNew ? 'Publier l’article' : 'Enregistrer les modifications')}
          </button>
        </div>
      </form>
    </div>
  );
}
