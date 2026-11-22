import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { useState } from 'react';
import { sessionStore } from '@/entities/session';
import { createQueryClient } from './query-client';
import { createAppRouter } from './router';

export function Providers() {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(() =>
    createAppRouter(queryClient, undefined, sessionStore),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
