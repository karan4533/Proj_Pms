import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.tasks[":taskId"].$patch({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated.");
      
      // Optimized: Update cache directly instead of invalidating everything
      queryClient.setQueryData(["task", data.id], { data });
      
      // Selectively update task lists that contain this task
      queryClient.setQueriesData(
        { queryKey: ["tasks"], exact: false },
        (old: any) => {
          if (!old?.documents) return old;
          return {
            ...old,
            documents: old.documents.map((task: any) =>
              task.id === data.id ? data : task
            )
          };
        }
      );
      
      // Only invalidate analytics for affected workspace/project
      if (data.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ["project-analytics", data.projectId],
          exact: true 
        });
      }
      if (data.workspaceId) {
        queryClient.invalidateQueries({ 
          queryKey: ["workspace-analytics", data.workspaceId],
          exact: true
        });
      }
    },
    onError: () => {
      toast.error("Failed to update task.");
    },
  });

  return mutation;
};
