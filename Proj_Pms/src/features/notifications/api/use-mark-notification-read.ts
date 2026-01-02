import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { refetchQueries } from "@/lib/production-fixes";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"]["read"].$patch({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return await response.json();
    },
    onSuccess: async () => {
      // Use production-safe refetch with serverless handling
      await refetchQueries(queryClient, ["notifications"]);
    },
  });

  return mutation;
};
