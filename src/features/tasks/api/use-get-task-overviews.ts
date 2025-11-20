import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTaskOverviewsProps {
  status?: string;
  taskId?: string;
}

export const useGetTaskOverviews = ({ status, taskId }: UseGetTaskOverviewsProps = {}) => {
  const query = useQuery({
    queryKey: ["task-overviews", status, taskId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (taskId) params.append("taskId", taskId);

      const response = await client.api["task-overviews"].$get({
        query: Object.fromEntries(params),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task overviews");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
