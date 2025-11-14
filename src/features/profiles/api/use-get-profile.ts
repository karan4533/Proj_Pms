import { useQuery } from "@tanstack/react-query";

export const useGetProfile = (userId: string) => {
  const query = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await fetch(`/api/profiles/${userId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: !!userId,
  });

  return query;
};
