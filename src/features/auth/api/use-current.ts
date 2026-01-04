import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["v2", "current"], // Added version prefix to force cache refresh
    queryFn: async () => {
      const response = await client.api.auth.current.$get();

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
