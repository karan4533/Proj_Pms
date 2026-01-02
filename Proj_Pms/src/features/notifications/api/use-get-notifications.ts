import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useGetNotifications = () => {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await client.api.notifications.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const { data } = await response.json();
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false, // Disable auto-refetch on focus
    // refetchInterval removed - use manual refetch instead
  });

  return query;
};

export const useGetUnreadCount = () => {
  const { data: notifications = [] } = useGetNotifications();
  const unreadCount = notifications.filter((n: any) => n.isRead === "false").length;
  return unreadCount;
};
