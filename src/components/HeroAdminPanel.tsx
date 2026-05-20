'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminList, adminCreate, adminUpdate, adminDelete, isAuthenticated } from '@/lib/admin-django';
import { HeroSection } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';

interface HeroFormState {
  title: string;
  title_en: string;
  title_ar: string;
  subtitle: string;
  subtitle_en: string;
  subtitle_ar: string;
  description: string;
  description_en: string;
  description_ar: string;
  cta_label: string;
  cta_label_en: string;
  cta_label_ar: string;
  cta_url: string;
  image: string;
  type: string;
  order: string;
}

const defaultFormState: HeroFormState = {
  title: '',
  title_en: '',
  title_ar: '',
  subtitle: '',
  subtitle_en: '',
  subtitle_ar: '',
  description: '',
  description_en: '',
  description_ar: '',
  cta_label: '',
  cta_label_en: '',
  cta_label_ar: '',
  cta_url: '',
  image: '',
  type: 'book',
  order: '0',
};

export default function HeroAdminPanel() {
  const router = useRouter();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [formState, setFormState] = useState<HeroFormState>(defaultFormState);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Chargement...');

  useEffect(() => {
    async function init() {
       const ok = await isAuthenticated();
       if (!ok) {
         router.push('/admin/login');
         return;
       }
       await loadHeroSections();
    }
    init();
  }, [router]);

  async function loadHeroSections() {
    try {
      const data = await adminList('hero-sections', { ordering: 'order' });
      setHeroSections(data || []);
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus('Erreur lors du chargement des sections hero.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(selectedId ? 'Mise à jour en cours...' : 'Création en cours...');

    try {
      const payload = {
          ...formState,
          order: Number(formState.order) || 0
      };

      if (selectedId) {
        await adminUpdate('hero-sections', selectedId, payload);
      } else {
        await adminCreate('hero-sections', payload);
      }

      await loadHeroSections();
      setStatus(selectedId ? 'Section hero mise à jour.' : 'Section hero créée.');
      setFormState(defaultFormState);
      setSelectedId(null);
    } catch (error) {
      setStatus('Erreur lors de la sauvegarde de la section hero.');
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit(hero: any) {
    setSelectedId(hero.id);
    setFormState({
      title: hero.title || '',
      title_en: hero.title_en || '',
      title_ar: hero.title_ar || '',
      subtitle: hero.subtitle || '',
      subtitle_en: hero.subtitle_en || '',
      subtitle_ar: hero.subtitle_ar || '',
      description: hero.description || '',
      description_en: hero.description_en || '',
      description_ar: hero.description_ar || '',
      cta_label: hero.cta_label || '',
      cta_label_en: hero.cta_label_en || '',
      cta_label_ar: hero.cta_label_ar || '',
      cta_url: hero.cta_url || '',
      image: hero.image_url || hero.image || '',
      type: hero.type || 'book',
      order: hero.order?.toString() || '0',
    });
    setStatus('Modification de la section hero');
  }

  async function handleDeleteHero(id: number) {
    if (!confirm('Supprimer cette section hero ?')) return;
    setStatus('Suppression en cours...');

    try {
      await adminDelete('hero-sections', id);
      await loadHeroSections();
      setStatus('Section hero supprimée.');
      if (selectedId === id) {
        setSelectedId(null);
        setFormState(defaultFormState);
      }
    } catch {
      setStatus('Erreur lors de la suppression.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Gestion des sections hero</h1>
            <p className="mt-1 text-sm text-gray-400 font-medium">Bannières rotatives de la page d&apos;accueil</p>
          </div>
          <span className="rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-600 border border-teal-100">{status || 'Prêt'}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Sections existantes</h2>
          <div className="space-y-4">
            {(heroSections || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10 italic">Aucune section hero trouvée.</p>
            ) : (
              (heroSections || []).map((hero) => (
                <div key={hero.id} className="rounded-2xl border border-gray-50 p-4 hover:border-teal-100 transition-all bg-gray-50/30">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">ID {hero.id} · {hero.type}</span>
                         <span className="text-[10px] font-black text-teal-500">Ordre: {hero.order}</span>
                      </div>
                      <h3 className="font-bold text-gray-800">{hero.title || 'Sans titre'}</h3>
                      <p className="text-xs text-gray-400 mt-1 truncate">{hero.cta_url || 'Pas de lien'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-xl bg-white border border-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-all" onClick={() => handleEdit(hero)}>
                        Modifier
                      </button>
                      <button className="flex-1 rounded-xl bg-white border border-gray-100 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" onClick={() => handleDeleteHero(hero.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{selectedId ? 'Modifier la section' : 'Nouvelle section'}</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">Titre (FR)</span>
                <input name="title" value={formState.title} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">Titre (EN)</span>
                <input name="title_en" value={formState.title_en} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
               <label className="block sm:col-span-2">
                <span className="text-xs font-bold text-gray-500 ml-1 block text-right">العنوان (عربي)</span>
                <input name="title_ar" value={formState.title_ar} onChange={handleChange} dir="rtl" className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">Sous-titre (FR)</span>
                <input name="subtitle" value={formState.subtitle} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">Ordre d&apos;affichage</span>
                <input type="number" name="order" value={formState.order} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-gray-500 ml-1">Description (FR)</span>
              <textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">CTA Label (FR)</span>
                <input name="cta_label" value={formState.cta_label} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-500 ml-1">Type</span>
                <select name="type" value={formState.type} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all">
                  <option value="book">Livre (Lien vers un livre)</option>
                  <option value="news">Actu (Lien vers un article)</option>
                  <option value="author">Auteur (Focus auteur)</option>
                  <option value="general">Général (Lien externe/manuel)</option>
                </select>
              </label>
            </div>

            <label className="block">
               <span className="text-xs font-bold text-gray-500 ml-1">Lien du bouton (URL)</span>
               <input name="cta_url" value={formState.cta_url} onChange={handleChange} className="mt-1.5 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all" placeholder="/fr/books/le-slug" />
            </label>

            <ImageUploader 
               value={formState.image} 
               onChange={(val) => setFormState(prev => ({ ...prev, image: val || '' }))} 
               label="Image de fond"
               hint="Format paysage recommandé"
            />

            <div className="flex flex-wrap gap-3 pt-4">
              <button type="submit" className="flex-1 rounded-2xl bg-teal-600 px-6 py-4 text-sm font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all">
                {selectedId ? '💾 Enregistrer' : '➕ Créer la section'}
              </button>
              {selectedId && (
                  <button type="button" className="rounded-2xl border border-gray-200 px-6 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all" onClick={() => { setSelectedId(null); setFormState(defaultFormState); setStatus('Annulé.'); }}>
                    Annuler
                  </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
