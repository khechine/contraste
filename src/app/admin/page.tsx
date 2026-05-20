'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminGetStats, isAuthenticated } from '@/lib/admin-django';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    books: 0,
    authors: 0,
    news: 0,
    press: 0,
    hero_sections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const ok = await isAuthenticated();
      if (!ok) {
        router.push('/admin/login');
        return;
      }

      try {
        const data = await adminGetStats();
        setStats({
          books: data.books || 0,
          authors: data.authors || 0,
          news: data.news || 0,
          press: data.press || 0,
          hero_sections: data.hero_sections || 0,
        });
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [router]);

  const statCards = [
    { name: 'Livres', value: stats.books, icon: '📚', color: 'bg-blue-500', href: '/admin/books' },
    { name: 'Auteurs', value: stats.authors, icon: '✍️', color: 'bg-teal-500', href: '/admin/authors' },
    { name: 'Actualités', value: stats.news, icon: '📰', color: 'bg-amber-500', href: '/admin/news' },
    { name: 'Presse', value: stats.press, icon: '📽️', color: 'bg-indigo-500', href: '/admin/press' },
  ];

  const quickActions = [
    { label: 'Nouveau livre', icon: '📖', href: '/admin/books/new', color: 'teal' },
    { label: 'Nouvel auteur', icon: '✍️', href: '/admin/authors/new', color: 'emerald' },
    { label: 'Nouvelle actualité', icon: '📰', href: '/admin/news/new', color: 'amber' },
    { label: 'Sections Hero', icon: '🖼️', href: '/admin/hero', color: 'purple' },
  ];

  const djangoAdminUrl = `${process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000'}/django-admin/`;

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
        <p className="text-gray-500 font-medium">Voici l&apos;état actuel de Contraste Éditions.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.a
            key={stat.name}
            href={stat.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group overflow-hidden relative block"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`}></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            {loading ? (
              <div className="h-10 w-16 bg-gray-100 animate-pulse rounded-lg mb-1"></div>
            ) : (
              <p className="text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
            )}
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">{stat.name}</p>
          </motion.a>
        ))}
      </div>

      {/* Quick actions + Django admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-teal-50 hover:text-teal-700 transition-all group border border-gray-100 hover:border-teal-100"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className="font-semibold text-gray-700 group-hover:text-teal-700 text-sm">{action.label}</span>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-teal-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-teal-500/20"
        >
          <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-white/10 blur-3xl rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-xl font-bold mb-3 leading-tight">Super-Admin Django</h3>
              <p className="text-teal-100 text-sm font-medium opacity-80 mb-6">
                Interface avancée pour la gestion technique : utilisateurs, permissions, données brutes.
              </p>
            </div>
            <a
              href={djangoAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-teal-700 font-bold py-4 rounded-2xl w-full shadow-lg hover:bg-teal-50 transition-colors text-center block"
            >
              Ouvrir le Super-Admin →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
