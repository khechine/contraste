'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminDirectus } from '@/lib/admin-directus';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    books: 0,
    authors: 0,
    news: 0,
    press: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
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

        // 2. Fetch stats
        const [books, authors, news, press] = await Promise.all([
          adminDirectus.request(() => ({ path: '/items/books?aggregate[count]=*', method: 'GET' })).catch(() => null),
          adminDirectus.request(() => ({ path: '/items/authors?aggregate[count]=*', method: 'GET' })).catch(() => null),
          adminDirectus.request(() => ({ path: '/items/news?aggregate[count]=*', method: 'GET' })).catch(() => null),
          adminDirectus.request(() => ({ path: '/items/press?aggregate[count]=*', method: 'GET' })).catch(() => null),
        ]) as any[];

        const getCount = (res: any) => {
          if (!res) return 0;
          const data = res.data || res; // Handle both {data: [...]} and [...]
          if (Array.isArray(data) && data.length > 0) {
            return parseInt(data[0].count) || 0;
          }
          return 0;
        };

        setStats({
          books: getCount(books),
          authors: getCount(authors),
          news: getCount(news),
          press: getCount(press),
        });
      } catch (error: any) {
        console.error('Failed to fetch dashboard stats:', error);
        if (error.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [router]);

  const statCards = [
    { name: 'Livres', value: stats.books, icon: '📚', color: 'bg-blue-500' },
    { name: 'Auteurs', value: stats.authors, icon: '✍️', color: 'bg-teal-500' },
    { name: 'Actualités', value: stats.news, icon: '📰', color: 'bg-amber-500' },
    { name: 'Presse', value: stats.press, icon: '📽️', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-10 py-4">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Bonjour, Administrateur 👋
        </motion.h1>
        <p className="text-gray-500 font-medium">Voici un aperçu de l'état actuel de Contraste Éditions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`}></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-3 h-3 rounded-full ${stat.color} absolute top-6 right-6 opacity-30`}></div>
            </div>
            {loading ? (
              <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mb-1"></div>
            ) : (
              <p className="text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
            )}
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm h-[400px] flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-2 text-2xl">
            📈
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bienvenue dans votre nouvelle régie</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Vous pouvez maintenant gérer tout le contenu de votre site web directement depuis cette interface. 
            Utilisez le menu latéral pour naviguer entre les différentes sections.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-teal-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-teal-500/20"
        >
          <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-white/10 blur-3xl rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4 leading-tight">Accès Rapide aux Images</h3>
              <p className="text-teal-100 text-sm font-medium opacity-80 mb-8">
                Gérez vos couvertures de livres et photos d'auteurs dans la galerie média centralisée.
              </p>
            </div>
            <button className="bg-white text-teal-700 font-bold py-4 rounded-2xl w-full shadow-lg hover:bg-teal-50 transition-colors">
              Ouvrir la Galerie
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
