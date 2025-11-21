import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

/**
 * Get current user's role in ANY workspace (checks first workspace found)
 * Used for global permission checks when no specific workspace context
 */
export const useGetCurrentUserRole = () => {
  const query = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const response = await client.api.members["role"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch user role");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

/**
 * Check if current user is admin (without workspace context)
 * Useful for global UI elements like sidebar
 */
export const useIsGlobalAdmin = () => {
  const { data: roleData, isLoading } = useGetCurrentUserRole();
  
  const isAdmin = roleData && (
    roleData.role === "ADMIN" || 
    roleData.role === "PROJECT_MANAGER" ||
    roleData.role === "MANAGEMENT"
  );

  return {
    data: isAdmin || false,
    isLoading
  };
};
