// In Next.js, this file would be called: app/providers.tsx
"use client";

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Detect production environment
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('yourdomain.com'));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: isProduction ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 min prod, 5 min dev
        gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on every mount
        refetchInterval: false, // Disable auto-refetch intervals
        refetchIntervalInBackground: false, // Disable background refetch
        refetchOnReconnect: false, // Don't refetch when network reconnects - prevents flicker
        // Intelligent retry: Don't retry 401/403 (auth errors), do retry 500/503 (server errors)
        retry: (failureCount, error: any) => {
          // Never retry authentication/authorization errors
          if (error?.message?.includes('401') || error?.message?.includes('403') || 
              error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden')) {
            return false;
          }
          // Retry server errors up to 3 times in production, 1 time in dev
          return failureCount < (isProduction ? 3 : 1);
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Network mode for better offline handling
        networkMode: 'offlineFirst',
        // Keep previous data while fetching new data - prevents loading flicker
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations in production (serverless timeout handling)
        retry: isProduction ? 2 : 1,
        networkMode: 'offlineFirst',
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
