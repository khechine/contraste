'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';

export default function MediaManagerPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const response = await adminDirectus.request(() => ({
        path: '/files',
        method: 'GET',
        params: {
          sort: '-uploaded_on',
          filter: '{"type":{"_starts_with":"image/"}}'
        }
      }));
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.contraste.tn';
      const token = await adminDirectus.getToken();
      
      const response = await fetch(`${BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        alert('Erreur lors de l’upload.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l’upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette image ?')) return;
    
    try {
      await adminDirectus.request(() => ({
        path: `/files/${id}`,
        method: 'DELETE'
      }));
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-10 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-500 font-medium">Gérez vos couvertures, portraits et assets visuels.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
        >
          {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '📤 Téléverser'}
        </button>
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*"
        />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={`loading-${i}`} className="aspect-square bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
            ))
          ) : (
            files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="group relative aspect-square bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                <img 
                  src={getImageUrl(file.id) || '/placeholder.png'} 
                  alt={file.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => {
                        const url = getImageUrl(file.id);
                        if (url) navigator.clipboard.writeText(url);
                        alert('URL copiée !');
                    }}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/40 transition-colors text-white"
                    title="Copier l'URL"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-3 bg-red-500/50 backdrop-blur-md rounded-xl hover:bg-red-500 transition-colors text-white"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-[10px] text-white font-medium truncate">{file.title || file.filename_download}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {!loading && files.length === 0 && (
        <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
           <div className="text-6xl mb-4 opacity-10">🖼️</div>
           <h3 className="text-xl font-bold text-gray-300">Votre médiathèque est vide</h3>
           <p className="text-gray-200">Commencez par ajouter des images pour votre catalogue.</p>
        </div>
      )}
    </div>
  );
}
