'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { InitialCashDrawer } from '../../components/InitialCashDrawerDialog';

export default function AddCashDrawerPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const unwrappedParams = use(params);
  const userId = unwrappedParams.userId;

  useEffect(() => {
    // Verify that the logged-in user matches the URL parameter
    if (user && user.id !== userId) {
      router.push('/unauthorized');
    }
  }, [user, userId, router]);

  return <InitialCashDrawer />;
}