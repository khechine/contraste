'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';

export default function NewsListPage() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchNews() {
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

        // 2. Fetch news
        const response = await adminDirectus.request(() => ({
          path: '/items/news',
          method: 'GET',
          params: {
            sort: '-date',
            fields: 'id,title,slug,image,date'
          }
        })) as any;
        setNews(response.data || response || []);
      } catch (error: any) {
        console.error('Failed to fetch news:', error);
        if (error.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [router]);

  const filteredNews = (news || []).filter(item => 
    item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actualités</h1>
          <p className="text-gray-500 font-medium">Gérez vos articles de blog et annonces d'événements.</p>
        </div>
        <Link 
          href="/admin/news/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>➕</span> Nouvel Article
        </Link>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <span className="text-gray-400 group-focus-within:text-teal-500 transition-colors">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Rechercher par titre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 shadow-sm shadow-gray-200/50 transition-all placeholder-gray-300 font-medium"
        />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Article</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Date</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`loading-${i}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 bg-gray-100 rounded-xl animate-pulse"></div>
                          <div className="h-5 w-60 bg-gray-100 rounded-lg animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  (filteredNews || []).map((item, index) => (
                    <motion.tr 
                      key={item?.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 rounded-xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform cursor-pointer border border-gray-100">
                            {item?.image ? (
                              <img 
                                src={getImageUrl(item.image) || '/placeholder-news.png'} 
                                alt={item?.title || 'Article'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1 bg-white">
                                NO IMAGE
                              </div>
                            )}
                          </div>
                          <Link href={`/admin/news/${item?.id}`} className="font-bold text-gray-800 hover:text-teal-600 transition-colors line-clamp-2 max-w-md">
                            {item?.title || 'Sans titre'}
                          </Link>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-sm text-gray-400 font-medium">
                          {item?.date ? new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non daté'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Link 
                            href={`/admin/news/${item?.id}`}
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
