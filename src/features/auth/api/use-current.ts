import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { AUTH_COOKIE } from "../constants";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["v2", "current"], // Added version prefix to force cache refresh
    queryFn: async () => {
      const response = await client.api.auth.current.$get();

      // Auto-delete invalid session cookie on 401
      if (response.status === 401 && typeof window !== 'undefined') {
        // Invalid session - delete the cookie to prevent infinite loop
        document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        console.log('[Auth] Deleted invalid session cookie');
      }

      // Return null for all errors (401, 500, etc.) - prevents retry loop
      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent constant refetching
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: "always", // Always refetch on mount to ensure fresh auth state
    retry: false, // CRITICAL: Never retry auth checks
  });

  return query;
};
