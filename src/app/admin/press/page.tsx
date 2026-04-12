'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';

export default function PressListPage() {
  const [press, setPress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPress() {
      try {
        const response = await adminDirectus.request(() => ({
          path: '/items/press',
          method: 'GET',
          params: {
            sort: '-publication_date',
            fields: 'id,title,media_name,publication_date,featured'
          }
        })) as any;
        setPress(response.data);
      } catch (error) {
        console.error('Failed to fetch press items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPress();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espace Presse</h1>
          <p className="text-gray-500 font-medium">Gérez vos coupures de presse, interviews et récompenses.</p>
        </div>
        <Link 
          href="/admin/press/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>➕</span> Ajouter un Article
        </Link>
      </header>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Article / Média</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Date</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Statut</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`loading-${i}`}>
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className="h-5 w-60 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                        <div className="h-5 w-20 bg-gray-50 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  press.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col min-w-0">
                          <Link href={`/admin/press/${item.id}`} className="font-bold text-gray-800 hover:text-teal-600 transition-colors line-clamp-1 mb-1">
                            {item.title}
                          </Link>
                          <span className="text-sm text-gray-400 font-bold">{item.media_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-sm text-gray-400 font-medium">
                          {item.publication_date ? new Date(item.publication_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                        {item.featured ? (
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                             ⭐ Vedette
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-100">
                             Standard
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Link 
                            href={`/admin/press/${item.id}`}
                            className="p-3 bg-gray-50 text-gray-500 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all font-bold border border-gray-100"
                            title="Modifier"
                          >
                            ✏️
                          </Link>
                          <button 
                            className="p-3 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all font-bold border border-gray-100"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
