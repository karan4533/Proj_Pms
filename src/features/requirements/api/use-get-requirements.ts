import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetRequirements = () => {
  const query = useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const response = await client.api.requirements.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch requirements");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
