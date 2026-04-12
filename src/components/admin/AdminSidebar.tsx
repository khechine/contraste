'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Livres', href: '/admin/books', icon: '📚' },
  { name: 'Auteurs', href: '/admin/authors', icon: '✍️' },
  { name: 'Actualités', href: '/admin/news', icon: '📰' },
  { name: 'Presse', href: '/admin/press', icon: '📽️' },
  { name: 'Galerie Média', href: '/admin/media', icon: '🖼️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-center h-20 border-b border-gray-50">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Contraste Admin
        </Link>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500"
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-50">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Système</p>
          <button 
            className="w-full text-left text-sm text-gray-600 hover:text-red-500 transition-colors py-1"
            onClick={() => {
              // Handle logout logic here
              localStorage.removeItem('directus_auth_token');
              window.location.href = '/admin/login';
            }}
          >
            Quitter la session
          </button>
        </div>
      </div>
    </div>
  );
}
