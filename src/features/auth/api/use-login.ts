import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login.$post({ json });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("error" in errorData ? errorData.error : "Invalid credentials");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      // CRITICAL: Invalidate queries to clear old auth state
      queryClient.invalidateQueries({ queryKey: ["v2", "current"] });
      queryClient.invalidateQueries({ queryKey: ["v2", "current-user-role"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      // Force navigation to home page to trigger server-side auth check
      // This ensures cookies are properly read and user session is established
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });

  return mutation;
};
