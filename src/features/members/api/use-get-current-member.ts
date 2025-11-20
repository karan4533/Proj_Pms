import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetCurrentMember = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["current-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.members["current"].$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current member");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: !!workspaceId,
  });

  return query;
};

export const useIsAdmin = (workspaceId: string) => {
  const { data: member } = useGetCurrentMember(workspaceId);
  
  const isAdmin = member && (
    member.role === "ADMIN" || 
    member.role === "PROJECT_MANAGER" ||
    member.role === "MANAGEMENT"
  );

  return isAdmin || false;
};
