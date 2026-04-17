'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminDirectus } from '@/lib/admin-directus';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';

export default function PressEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [press, setPress] = useState<any>({
    title: '',
    media_name: '',
    publication_date: new Date().toISOString().split('T')[0],
    excerpt: '',
    article_url: '',
    featured: false,
    logo: null,
    file_attachment: null
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPress() {
      try {
        // 1. Auth check
        const user = await adminDirectus.request(() => ({
          path: '/users/me',
          method: 'GET',
        })).catch(() => null);

        if (!user) {
          router.push('/admin/login');
          return;
        }

        if (!isNew) {
          const response = await adminDirectus.request(() => ({
            path: `/items/press/${id}`,
            method: 'GET'
          })) as any;
          const data = response.data || response;
          if (data) {
            setPress((prev: any) => ({ ...prev, ...data }));
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch press item:', err);
        if (err.status === 401) {
          router.push('/admin/login');
        } else {
          setError("Impossible de charger l'article de presse.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPress();
  }, [id, isNew, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...press };
      if (isNew) {
        await adminDirectus.request(() => ({
          path: '/items/press',
          method: 'POST',
          body: JSON.stringify(payload)
        }));
      } else {
        await adminDirectus.request(() => ({
          path: `/items/press/${id}`,
          method: 'PATCH',
          body: JSON.stringify(payload)
        }));
      }
      router.push('/admin/press');
    } catch (err: any) {
      console.error('Failed to save press item:', err);
      setError('Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type } = e.target as any;
    setPress((prev: any) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as any).checked : value 
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/press" className="text-teal-600 font-bold flex items-center gap-2 mb-2 hover:translate-x-[-4px] transition-transform">
            ← Archive Presse
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Ajouter une parution' : `Modifier la parution`}
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
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 ml-1">Titre de l'article</label>
            <input
              type="text"
              name="title"
              required
              value={press?.title || ''}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Nom du Média</label>
              <input
                type="text"
                name="media_name"
                required
                value={press?.media_name || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                placeholder="Ex: La Presse, Kapitalis..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Date de parution</label>
              <input
                type="date"
                name="publication_date"
                value={press?.publication_date || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 ml-1">Lien vers l'article (URL)</label>
            <input
              type="text"
              name="article_url"
              value={press?.article_url || ''}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-mono text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center py-2 px-4">
             <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={press?.featured || false}
              onChange={handleChange}
              className="w-6 h-6 text-teal-600 bg-gray-100 border-gray-200 rounded-lg focus:ring-teal-500 focus:ring-offset-0"
            />
            <label htmlFor="featured" className="ml-4 text-sm font-bold text-gray-700 cursor-pointer">
              Mettre en avant sur la page presse ⭐
            </label>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 ml-1">Extrait du texte (Français)</label>
            <RichTextEditor
              name="excerpt"
              value={press?.excerpt || ''}
              onChange={handleChange}
              placeholder="Saisissez un court extrait de l'article..."
              minHeight="200px"
            />
          </div>
        </div>

        {/* Logo image */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Logo du média</h2>
          <ImageUploader
            value={press?.logo || null}
            onChange={(fileId) => setPress((prev: any) => ({ ...prev, logo: fileId || null }))}
            label="Logo"
            hint="Format carré ou transparent recommandé"
          />
        </div>

        <div className="flex items-center justify-end gap-4 pb-10">
          <Link 
            href="/admin/press"
            className="px-8 py-4 bg-white text-gray-500 font-bold rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isNew ? 'Ajouter la parution' : 'Enregistrer les modifications')}
          </button>
        </div>
      </form>
    </div>
  );
}
