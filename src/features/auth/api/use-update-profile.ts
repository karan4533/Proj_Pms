import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.profile["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.auth.profile["$patch"]>["json"];

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.profile["$patch"]({ json });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.refetchQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  return mutation;
};
