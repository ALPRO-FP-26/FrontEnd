'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

/**
 * useAuthGuard — redirects depending on auth state.
 *
 * @param requireAuth  true  → redirect to /login if NOT authenticated
 *                     false → redirect to /dashboard if already authenticated
 */
export function useAuthGuard(requireAuth: boolean) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();

    if (requireAuth && !authed) {
      router.replace('/login');
    } else if (!requireAuth && authed) {
      router.replace('/dashboard');
    } else {
      setChecked(true);
    }
  }, [requireAuth, router]);

  return checked;
}
