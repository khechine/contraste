'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';

interface ImageUploaderProps {
  value: string | null;
  onChange: (fileId: string) => void;
  label?: string;
  hint?: string;
}

export default function ImageUploader({ value, onChange, label = 'Image', hint }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const previewUrl = value ? getImageUrl(value) : null;

  const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.contraste.tn';

  const getToken = useCallback(async () => {
    return await adminDirectus.getToken();
  }, []);

  // Load gallery when picker is opened
  useEffect(() => {
    if (!pickerOpen) return;
    setGalleryLoading(true);

    getToken().then(async (token) => {
      if (!token) { setGalleryLoading(false); return; }
      try {
        const res = await fetch(`${BASE_URL}/files?sort=-uploaded_on&filter[type][_starts_with]=image/&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGalleryFiles(data?.data || []);
        }
      } catch (e) {
        console.error('Gallery load failed:', e);
      } finally {
        setGalleryLoading(false);
      }
    });
  }, [pickerOpen, BASE_URL, getToken]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) { setError('Session expirée. Veuillez vous reconnecter.'); return; }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BASE_URL}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 403) { setError('Permission refusée.'); return; }
      if (!res.ok) { setError(`Erreur upload (HTTP ${res.status}).`); return; }

      const data = await res.json();
      const fileId = data?.data?.id || data?.id;
      if (fileId) onChange(fileId);
      else setError("Impossible de récupérer l'ID du fichier.");
    } catch (err) {
      setError("Erreur réseau lors de l'upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function selectFromGallery(fileId: string) {
    onChange(fileId);
    setPickerOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-500">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative group rounded-3xl overflow-hidden border border-gray-100 shadow-sm max-w-[220px]">
          <img src={previewUrl} alt="Aperçu" className="w-full aspect-[3/4] object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-bold">Image actuelle</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          {uploading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : '📤'
          }
          {previewUrl ? 'Remplacer' : 'Téléverser une image'}
        </button>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-2xl border border-gray-200 transition-all"
        >
          🖼️ Choisir depuis la médiathèque
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-red-500 text-sm font-bold rounded-2xl border border-gray-100 hover:border-red-100 transition-all"
          >
            ✕ Retirer
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Media Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Choisir depuis la médiathèque</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Gallery grid */}
            <div className="overflow-y-auto p-6 flex-1">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : galleryFiles.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="font-medium">Aucune image dans la médiathèque</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryFiles.map((file: any) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => selectFromGallery(file.id)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg  ${
                        value === file.id ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-gray-100 hover:border-teal-400'
                      }`}
                    >
                      <img
                        src={getImageUrl(file.id) || ''}
                        alt={file.title || file.filename_download || ''}
                        className="w-full h-full object-cover"
                      />
                      {value === file.id && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <span className="text-2xl">✓</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white font-medium truncate">
                          {file.title || file.filename_download || '-'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
