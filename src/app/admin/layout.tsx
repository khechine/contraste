'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminDirectus } from '@/lib/admin-directus';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch current user to verify token
        const user = await adminDirectus.request(() => ({
          path: '/users/me',
          method: 'GET',
        }));
        
        if (user) {
          setAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Admin Auth Check Failed:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl shadow-teal-500/20"></div>
          <p className="text-gray-400 font-medium animate-pulse">Chargement de l'espace admin...</p>
        </div>
      </div>
    );
  }

  // If we're on the login page, just show the login page content
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If we're not authorized yet (and not loading), we'll be redirected anyway
  if (!authorized) {
    return null;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-900 overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
