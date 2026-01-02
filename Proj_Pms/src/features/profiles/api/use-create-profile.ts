import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateProfileProps {
  name: string;
  email: string;
  password: string;
  mobileNo?: string;
  native?: string;
  designation?: string;
  department?: string;
  experience?: number;
  dateOfBirth?: string;
  dateOfJoining?: string;
  skills?: string[];
}

interface UseCreateProfileOptions {
  onSuccess?: () => void;
}

export const useCreateProfile = (options?: UseCreateProfileOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateProfileProps) => {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Profile created successfully");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  return mutation;
};
