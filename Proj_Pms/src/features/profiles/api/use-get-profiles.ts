import { useQuery } from "@tanstack/react-query";

export const useGetProfiles = () => {
  const query = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
