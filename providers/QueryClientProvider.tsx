'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error: any) => {
              toast({
                variant: 'destructive',
                title: '에러 발생',
                description: error?.message || '알 수 없는 오류가 발생했습니다',
              });
            },
          },
        },
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
      <Toaster />
    </TanstackQueryClientProvider>
  );
}

// docs: https://tanstack.com/query/latest/docs/framework/react/quick-start
