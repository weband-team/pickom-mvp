'use client';

import { useEffect, useState } from 'react';
import { useSession } from './hooks/use-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refresh, status } = useSession();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (isFetching) return;
      setIsFetching(true);
      await refresh();
      setIsFetching(false);
    }

    if (status === 'loading') {
      fetchUser();
    }
  }, [refresh, status]);

  // Показываем загрузку пока проверяем аутентификацию
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
} 