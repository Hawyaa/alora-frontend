'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        alert('Please login to access admin panel');
        router.push('/login?redirect=/admin');
      } else if (user.role !== 'admin') {
        alert('You need admin privileges to access this page');
        router.push('/');
      } else {
        setChecking(false);
      }
    }
  }, [user, isLoading, router]);

  if (checking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Simple Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Alora Lipgloss Admin</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              View Store
            </Link>
            <Link href="/admin" className="text-pink-600 font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
}