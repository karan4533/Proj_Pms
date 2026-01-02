/**
 * Production-specific fixes for Vercel deployment
 * Handles serverless environment differences
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Check if running in production serverless environment
 */
export const isServerless = () => {
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1';
};

/**
 * Get appropriate cache headers for production
 */
export const getCacheHeaders = (maxAge: number = 0) => {
  if (isServerless()) {
    return {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=59`,
    };
  }
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
};

/**
 * Handle serverless cold start delays
 */
export const warmupDelay = async () => {
  if (isServerless()) {
    // Add small delay for cold starts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Get API timeout based on environment
 */
export const getApiTimeout = () => {
  return isServerless() ? 50000 : 30000; // 50s for Vercel, 30s for local
};

/**
 * Production-safe query refetch that handles serverless cold starts
 * Uses invalidateQueries + refetch for immediate UI updates
 */
export const refetchQueries = async (
  queryClient: QueryClient,
  queryKey: string[],
  options?: { exact?: boolean; force?: boolean }
) => {
  const { exact = false, force = true } = options || {};

  // 1. Invalidate the queries (marks them as stale)
  await queryClient.invalidateQueries({
    queryKey,
    exact,
  });

  // 2. Force refetch active queries immediately (don't wait for next render)
  if (force) {
    await queryClient.refetchQueries({
      queryKey,
      type: 'active',
      exact,
    });
  }

  // 3. In production, add small delay for serverless processing
  if (isServerless()) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};
