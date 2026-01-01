// In Next.js, this file would be called: app/providers.tsx
"use client";

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 5 * 60 * 1000, // 5 minutes - prevent constant refetching
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect unused queries
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on every mount
        refetchInterval: false, // Disable auto-refetch intervals
        refetchIntervalInBackground: false, // Disable background refetch
        retry: 2, // Retry failed requests 2 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
