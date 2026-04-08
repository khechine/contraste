'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { HeroSection } from '@/lib/types';

interface HeroFormState {
  title_fr: string;
  title_en: string;
  title_ar: string;
  subtitle_fr: string;
  subtitle_en: string;
  subtitle_ar: string;
  description_fr: string;
  description_en: string;
  description_ar: string;
  cta_label_fr: string;
  cta_label_en: string;
  cta_label_ar: string;
  cta_url: string;
  image: string;
  type: string;
  order: string;
}

const defaultFormState: HeroFormState = {
  title_fr: '',
  title_en: '',
  title_ar: '',
  subtitle_fr: '',
  subtitle_en: '',
  subtitle_ar: '',
  description_fr: '',
  description_en: '',
  description_ar: '',
  cta_label_fr: '',
  cta_label_en: '',
  cta_label_ar: '',
  cta_url: '',
  image: '',
  type: 'book',
  order: '0',
};

function buildPayload(form: HeroFormState) {
  return {
    title: form.title_fr,
    title_en: form.title_en,
    title_ar: form.title_ar,
    subtitle: form.subtitle_fr,
    subtitle_en: form.subtitle_en,
    subtitle_ar: form.subtitle_ar,
    description: form.description_fr,
    description_en: form.description_en,
    description_ar: form.description_ar,
    cta_label: form.cta_label_fr,
    cta_label_en: form.cta_label_en,
    cta_label_ar: form.cta_label_ar,
    cta_url: form.cta_url,
    image: form.image || null,
    type: form.type,
    order: Number(form.order),
  };
}

export default function HeroAdminPanel() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [formState, setFormState] = useState<HeroFormState>(defaultFormState);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Chargement...');

  useEffect(() => {
    loadHeroSections();
  }, []);

  async function loadHeroSections() {
    try {
      const response = await fetch('/api/admin/hero');
      if (!response.ok) throw new Error('Impossible de charger les héros.');
      const data = await response.json();
      setHeroSections(data);
      setStatus('');
    } catch (error) {
      setStatus('Erreur lors du chargement des sections hero.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(selectedId ? 'Mise à jour en cours...' : 'Création en cours...');

    try {
      const payload = buildPayload(formState);
      const method = selectedId ? 'PATCH' : 'POST';
      const url = selectedId ? `/api/admin/hero/${selectedId}` : '/api/admin/hero';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Échec de la sauvegarde.');
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

  function handleEdit(hero: HeroSection) {
    setSelectedId(hero.id);
    setFormState({
      title_fr: hero.title || '',
      title_en: hero.title_en || '',
      title_ar: hero.title_ar || '',
      subtitle_fr: hero.subtitle || '',
      subtitle_en: hero.subtitle_en || '',
      subtitle_ar: hero.subtitle_ar || '',
      description_fr: hero.description || '',
      description_en: hero.description_en || '',
      description_ar: hero.description_ar || '',
      cta_label_fr: hero.cta_label || '',
      cta_label_en: hero.cta_label_en || '',
      cta_label_ar: hero.cta_label_ar || '',
      cta_url: hero.cta_url || '',
      image: hero.image || '',
      type: hero.type || 'book',
      order: hero.order?.toString() || '0',
    });
    setStatus('Modification de la section hero');
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette section hero ?')) return;
    setStatus('Suppression en cours...');

    try {
      const response = await fetch(`/api/admin/hero/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Impossible de supprimer.');
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Gestion des sections hero</h1>
            <p className="mt-1 text-sm text-slate-500">Créer, modifier ou supprimer les hero cards.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 self-start sm:self-auto">{status || 'Prêt'}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Sections hero existantes</h2>
          <div className="space-y-3">
            {heroSections.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune section hero trouvée.</p>
            ) : (
              heroSections.map((hero) => (
                <div key={hero.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">ID {hero.id} · {hero.type || 'general'}</p>
                      <h3 className="font-medium mt-1 text-sm sm:text-base">{hero.title || hero.title_en || hero.title_ar || 'Sans titre'}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">{hero.cta_url || 'Pas de lien'} · ordre {hero.order ?? 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 sm:flex-none rounded-xl border border-slate-300 px-4 py-2.5 sm:py-1.5 text-sm text-slate-700 hover:bg-slate-100 min-h-[44px]" onClick={() => handleEdit(hero)}>
                        Modifier
                      </button>
                      <button className="flex-1 sm:flex-none rounded-xl border border-rose-300 px-4 py-2.5 sm:py-1.5 text-sm text-rose-700 hover:bg-rose-50 min-h-[44px]" onClick={() => handleDelete(hero.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Formulaire</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Titre FR</span>
                <input name="title_fr" value={formState.title_fr} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Titre EN</span>
                <input name="title_en" value={formState.title_en} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Sous-titre FR</span>
                <input name="subtitle_fr" value={formState.subtitle_fr} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Sous-titre EN</span>
                <input name="subtitle_en" value={formState.subtitle_en} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Description FR</span>
              <textarea name="description_fr" value={formState.description_fr} onChange={handleChange} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Description EN</span>
              <textarea name="description_en" value={formState.description_en} onChange={handleChange} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">CTA label FR</span>
                <input name="cta_label_fr" value={formState.cta_label_fr} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">CTA label EN</span>
                <input name="cta_label_en" value={formState.cta_label_en} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">URL CTA</span>
                <input name="cta_url" value={formState.cta_url} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm" placeholder="/fr/livres/mon-livre" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Type</span>
                <select name="type" value={formState.type} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 sm:py-2 text-base sm:text-sm">
                  <option value="book">Book</option>
                  <option value="news">News</option>
                  <option value="general">General</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 sm:py-3 text-base sm:text-sm font-semibold text-white hover:bg-slate-800 min-h-[50px] sm:min-h-[44px]">
                {selectedId ? 'Mettre à jour' : 'Créer la section'}
              </button>
              <button type="button" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3.5 sm:py-3 text-base sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[50px] sm:min-h-[44px]" onClick={() => { setSelectedId(null); setFormState(defaultFormState); setStatus('Formulaire réinitialisé.'); }}>
                Annuler
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
