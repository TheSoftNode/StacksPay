'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on authentication errors
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on authentication errors
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render QueryClientProvider after mount to prevent hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
