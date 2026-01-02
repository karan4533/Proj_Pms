import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Get comments for a bug
export const useGetBugComments = (bugId: string) => {
  return useQuery({
    queryKey: ["bug-comments", bugId],
    queryFn: async () => {
      const response = await client.api.bugs[":bugId"]["comments"].$get({
        param: { bugId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug comments");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: !!bugId,
  });
};

// Create a comment on a bug
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bugId, comment, fileUrl }: { bugId: string; comment: string; fileUrl?: string }) => {
      const response = await client.api.bugs[":bugId"]["comments"].$post({
        param: { bugId },
        json: { comment, fileUrl },
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const { data } = await response.json();
      return data;
    },
    onSuccess: (_, { bugId }) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({ queryKey: ["bug-comments", bugId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
};
