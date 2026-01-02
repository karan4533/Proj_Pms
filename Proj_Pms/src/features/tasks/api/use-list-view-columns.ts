import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

// Types
export type ListViewColumn = {
  id: string;
  workspaceId: string | null; // Nullable for backward compatibility
  projectId: string | null;   // Project-specific columns
  fieldName: string;
  displayName: string;
  columnType: 'text' | 'select' | 'user' | 'date' | 'labels' | 'priority';
  width: number;
  position: number;
  isVisible: boolean;
  isSortable: boolean;
  isFilterable: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

// Get all columns for a project
export const useGetListViewColumns = (projectId: string) => {
  return useQuery({
    queryKey: ["list-view-columns", projectId],
    queryFn: async () => {
      console.log('🔍 Fetching columns for projectId:', projectId);
      
      // @ts-ignore - TypeScript has issues with bracket notation in nested routes
      const response = await client.api.tasks["list-view"].columns.$get({
        query: { projectId },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch columns:', response.status, response.statusText);
        throw new Error("Failed to fetch list view columns");
      }

      const { data } = await response.json();
      console.log('✅ Columns fetched:', {
        projectId,
        count: data.length,
        columns: data.map((c: any) => ({ fieldName: c.fieldName, displayName: c.displayName, isVisible: c.isVisible }))
      });
      
      return data as ListViewColumn[];
    },
    enabled: !!projectId,
  });
};

// Create a new column
export const useCreateListViewColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: {
      projectId: string;
      fieldName: string;
      displayName: string;
      columnType: 'text' | 'select' | 'user' | 'date' | 'labels' | 'priority';
      width?: number;
      position?: number;
      isVisible?: boolean;
      isSortable?: boolean;
      isFilterable?: boolean;
    }) => {
      // @ts-ignore - TypeScript has issues with bracket notation in nested routes
      const response = await client.api.tasks["list-view"].columns.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create column");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["list-view-columns", variables.projectId] 
      });
    },
  });
};

// Update a column
export const useUpdateListViewColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, updates }: { 
      id: string; 
      projectId: string; 
      updates: {
        displayName?: string;
        width?: number;
        position?: number;
        isVisible?: boolean;
      }
    }) => {
      // @ts-ignore - TypeScript has issues with bracket notation in nested routes
      const response = await client.api.tasks["list-view"].columns[":id"].$patch({
        param: { id },
        json: updates,
      });

      if (!response.ok) {
        throw new Error("Failed to update column");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["list-view-columns", variables.projectId] 
      });
    },
  });
};

// Reorder columns
export const useReorderListViewColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, columns }: { 
      projectId: string; 
      columns: { id: string; position: number; }[]
    }) => {
      // @ts-ignore - TypeScript has issues with bracket notation in nested routes
      const response = await client.api.tasks["list-view"].columns.reorder.$post({
        json: { columns },
      });

      if (!response.ok) {
        throw new Error("Failed to reorder columns");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["list-view-columns", variables.projectId] 
      });
    },
  });
};

// Delete a column
export const useDeleteListViewColumn = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; projectId: string }>({
    mutationFn: async ({ id }) => {
      // @ts-ignore - TypeScript has issues with bracket notation in nested routes
      const response = await client.api.tasks["list-view"].columns[":id"].$delete({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to delete column");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["list-view-columns", variables.projectId] 
      });
    },
  });
};
