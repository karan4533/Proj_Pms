import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BulkUploadProfilesProps {
  file: File;
}

export const useBulkUploadProfiles = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ file }: BulkUploadProfilesProps) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profiles/bulk-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload profiles");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully created ${data.count} profile(s)`);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload profiles");
    },
  });

  return mutation;
};
