import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

/**
 * Get all employees (admin only)
 * Used for filtering attendance records by employee
 */
export const useGetAllEmployees = () => {
  const query = useQuery({
    queryKey: ["all-employees"],
    queryFn: async () => {
      const response = await client.api.members["all-employees"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
