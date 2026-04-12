'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';

export default function BooksListPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await adminDirectus.request(() => ({
          path: '/items/books',
          method: 'GET',
          params: {
            sort: '-id',
            fields: 'id,title,slug,cover_image,author_name,category,price_dt'
          }
        })) as any;
        setBooks(response.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const filteredBooks = (books || []).filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bibliothèque</h1>
          <p className="text-gray-500 font-medium">Gérez votre catalogue de livres, prix et métadonnées.</p>
        </div>
        <Link 
          href="/admin/books/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>➕</span> Nouveau Livre
        </Link>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <span className="text-gray-400 group-focus-within:text-teal-500 transition-colors">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Rechercher par titre ou auteur..."
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
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Livre</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Catégorie</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Prix</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`loading-${i}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-20 bg-gray-100 rounded-xl animate-pulse flex-shrink-0"></div>
                          <div className="space-y-2">
                            <div className="h-5 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-50 rounded-lg animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                        <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="h-5 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredBooks.map((book, index) => (
                    <motion.tr 
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4 text-balanced">
                          <div className="w-14 h-20 rounded-xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform cursor-pointer border border-gray-100">
                            {book.cover_image ? (
                              <img 
                                src={getImageUrl(book.cover_image) || '/placeholder-book.png'} 
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1 bg-white leading-tight">
                                NO COVER
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link href={`/admin/books/${book.id}`} className="font-bold text-gray-800 hover:text-teal-600 transition-colors line-clamp-1">
                              {book.title}
                            </Link>
                            <span className="text-sm text-gray-400 font-medium line-clamp-1">{book.author_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                          {book.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-sm font-bold text-gray-700">
                          {book.price_dt ? `${book.price_dt} DT` : 'Offert'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Link 
                            href={`/admin/books/${book.id}`}
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
        
        {!loading && filteredBooks.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-6xl mb-4 opacity-20 text-gray-400">🔍</div>
            <h3 className="text-xl font-bold text-gray-400">Aucun livre trouvé</h3>
            <p className="text-gray-300">Réduisez vos filtres ou créez votre premier livre.</p>
          </div>
        )}
      </div>
    </div>
  );
}
