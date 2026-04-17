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
    <div className="flex flex-col md:w-64 bg-white border-b md:border-r border-gray-100 md:h-screen md:sticky top-0 z-40">
      <div className="flex items-center justify-between md:justify-center px-4 md:px-0 h-16 md:h-20 border-b border-gray-50 flex-shrink-0">
        <Link href="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Contraste Admin
        </Link>
        <button 
            className="md:hidden text-xs text-red-500 font-semibold px-3 py-1 bg-red-50 rounded-lg whitespace-nowrap"
            onClick={() => {
              localStorage.removeItem('directus_auth_token');
              window.location.href = '/admin/login';
            }}
          >
            Quitter
        </button>
      </div>
      
      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto flex-1 px-4 py-3 md:py-8 space-x-2 md:space-x-0 md:space-y-2 scrollbar-hide">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 group whitespace-nowrap flex-shrink-0 ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-2 md:mr-3 text-lg md:text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm md:text-base">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-teal-500"
                />
              )}
            </Link>
          );
        })}
        {/* Adds visual padding to the end of scrollable list on mobile */}
        <div className="w-2 md:hidden flex-shrink-0" />
      </nav>

      <div className="hidden md:block p-4 border-t border-gray-50 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Système</p>
          <button 
            className="w-full text-left text-sm text-gray-600 hover:text-red-500 transition-colors py-1"
            onClick={() => {
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
