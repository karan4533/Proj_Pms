import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.projects["bulk-delete"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.projects["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteProjects = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.projects["bulk-delete"]["$post"]({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).error || "Failed to delete projects");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully deleted ${data.data.deletedCount} project(s)`);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete projects");
    },
  });

  return mutation;
};
