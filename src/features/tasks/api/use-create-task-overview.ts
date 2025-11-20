import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { CreateTaskOverviewPayload } from "../types";

export const useCreateTaskOverview = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateTaskOverviewPayload) => {
      const response = await client.api["task-overviews"].$post({
        json: payload,
      });

      if (!response.ok) {
        // Try to parse JSON error, fallback to text
        let errorMessage = "Failed to submit task overview";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Task overview submitted successfully! Awaiting admin review.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-overviews"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit task overview");
    },
  });

  return mutation;
};
