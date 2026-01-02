import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMsg = 'Failed to delete profile';
        try {
          const error = await response.json();
          errorMsg = error.error || error.message || errorMsg;
        } catch {
          // If JSON parsing fails, use status text
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete profile");
    },
  });

  return mutation;
};
