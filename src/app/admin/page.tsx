'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      router.push('/admin/portfolio');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return null;
}
