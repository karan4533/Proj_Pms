import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateProfileProps {
  userId: string;
  name: string;
  email: string;
  mobileNo?: string;
  native?: string;
  designation?: string;
  department?: string;
  experience?: number;
  dateOfBirth?: string;
  dateOfJoining?: string;
  skills?: string[];
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, ...data }: UpdateProfileProps) => {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to update profile';
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
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return mutation;
};
