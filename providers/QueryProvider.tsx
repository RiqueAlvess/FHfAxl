'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

/**
 * Provider para React Query
 * Gerencia cache e estado de dados no cliente
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 1 minuto antes de considerar stale
            staleTime: 60 * 1000,
            // Manter dados em cache por 5 minutos
            gcTime: 5 * 60 * 1000,
            // Retry automático em caso de falha
            retry: 1,
            // Refetch quando a janela ganha foco
            refetchOnWindowFocus: false,
            // Refetch ao reconectar
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry automático em mutations
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
