import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Start Shift
type StartShiftResponseType = InferResponseType<typeof client.api.attendance["start-shift"]["$post"], 200>;
type StartShiftRequestType = InferRequestType<typeof client.api.attendance["start-shift"]["$post"]>["json"];

export const useStartShift = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<StartShiftResponseType, Error, StartShiftRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.attendance["start-shift"]["$post"]({ json });
      
      if (!response.ok) {
        throw new Error("Failed to start shift");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Shift started successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["active-shift"] });
    },
    onError: () => {
      toast.error("Failed to start shift");
    },
  });

  return mutation;
};

// End Shift
type EndShiftResponseType = InferResponseType<typeof client.api.attendance["end-shift"]["$post"], 200>;
type EndShiftRequestType = InferRequestType<typeof client.api.attendance["end-shift"]["$post"]>["json"];

export const useEndShift = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<EndShiftResponseType, Error, EndShiftRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.attendance["end-shift"]["$post"]({ json });
      
      if (!response.ok) {
        throw new Error("Failed to end shift");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Shift ended successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["active-shift"] });
    },
    onError: () => {
      toast.error("Failed to end shift");
    },
  });

  return mutation;
};

// Get Active Shift
export const useGetActiveShift = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["active-shift", workspaceId],
    queryFn: async () => {
      const response = await client.api.attendance["active-shift"][":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active shift");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

// Get Attendance Records (Admin only)
export const useGetAttendanceRecords = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["attendance", workspaceId],
    queryFn: async () => {
      const response = await client.api.attendance[":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance records");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

// Get My Attendance History
export const useGetMyAttendance = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["my-attendance", workspaceId],
    queryFn: async () => {
      const response = await client.api.attendance["my-attendance"][":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch my attendance");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

// Update Tasks
type UpdateTasksResponseType = InferResponseType<typeof client.api.attendance["update-tasks"][":attendanceId"]["$patch"], 200>;
type UpdateTasksRequestType = InferRequestType<typeof client.api.attendance["update-tasks"][":attendanceId"]["$patch"]>["json"];

export const useUpdateTasks = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    UpdateTasksResponseType,
    Error,
    { attendanceId: string } & UpdateTasksRequestType
  >({
    mutationFn: async ({ attendanceId, ...json }) => {
      const response = await client.api.attendance["update-tasks"][":attendanceId"]["$patch"]({
        param: { attendanceId },
        json,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update tasks");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Tasks updated successfully");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => {
      toast.error("Failed to update tasks");
    },
  });

  return mutation;
};
