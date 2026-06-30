'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { logoutAction } from '@/actions/auth/authActions';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.replace('/auth/login');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </button>
  );
}