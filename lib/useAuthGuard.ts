'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

export function useAuthGuard(requireAuth: boolean, requiredRole?: string) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    if (requireAuth && !authed) {
      router.replace('/login');
    } else if (!requireAuth && authed) {
      router.replace('/dashboard');
    } else if (requireAuth && authed && requiredRole && role !== requiredRole) {
      router.replace('/dashboard');
    } else {
      setChecked(true);
    }
  }, [requireAuth, requiredRole, router]);

  return checked;
}