import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { refetchQueries } from "@/lib/production-fixes";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$delete"]
>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"].$delete({ param });

      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }

      return await response.json();
    },
    onSuccess: async ({ data }) => {
      toast.success("Task deleted.");
      
      // Optimized: Remove from cache and update lists directly
      queryClient.removeQueries({ queryKey: ["task", data.id] });
      
      // Optimistically remove from task lists
      queryClient.setQueriesData(
        { queryKey: ["tasks"], exact: false },
        (old: any) => {
          if (!old?.documents) return old;
          return {
            ...old,
            documents: old.documents.filter((task: any) => task.id !== data.id),
            total: Math.max(0, old.total - 1)
          };
        }
      );
      
      // Invalidate all analytics (we don't have projectId/workspaceId from delete response)
      queryClient.invalidateQueries({ 
        queryKey: ["project-analytics"],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["workspace-analytics"],
        exact: false
      });
      
      // Use production-safe refetch with serverless handling
      await refetchQueries(queryClient, ["tasks"]);
    },
    onError: () => {
      toast.error("Failed to delete task.");
    },
  });

  return mutation;
};
