import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { refetchQueries } from "@/lib/production-fixes";

type ResponseType = InferResponseType<(typeof client.api.tasks)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tasks)["$post"]>;

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create task.");
      }

      return await response.json();
    },
    onSuccess: async (data) => {
      toast.success("Task created.");
      
      // Optimized: Only invalidate relevant queries
      const newTask = data.data;
      
      // Update specific task list cache instead of full invalidation
      queryClient.setQueryData(
        ["tasks", newTask.workspaceId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            documents: [newTask, ...old.documents],
            total: old.total + 1
          };
        }
      );
      
      // Only invalidate analytics for affected workspace/project
      if (newTask.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ["project-analytics", newTask.projectId],
          exact: true 
        });
      }
      if (newTask.workspaceId) {
        queryClient.invalidateQueries({ 
          queryKey: ["workspace-analytics", newTask.workspaceId],
          exact: true
        });
      }
      
      // Use production-safe refetch with serverless handling
      await refetchQueries(queryClient, ["tasks"]);
      await refetchQueries(queryClient, ["activity-logs"]);
    },
    onError: () => {
      toast.error("Failed to create task.");
    },
  });

  return mutation;
};
