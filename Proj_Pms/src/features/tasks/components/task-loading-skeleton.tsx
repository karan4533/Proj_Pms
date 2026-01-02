import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for task table rows
 * Provides visual feedback while data is loading
 */
export function TaskTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 border-b animate-pulse"
        >
          {/* Checkbox */}
          <Skeleton className="h-4 w-4 rounded" />
          
          {/* Issue ID */}
          <Skeleton className="h-4 w-24" />
          
          {/* Summary */}
          <Skeleton className="h-4 flex-1" />
          
          {/* Status */}
          <Skeleton className="h-6 w-20 rounded-full" />
          
          {/* Priority */}
          <Skeleton className="h-6 w-16 rounded-full" />
          
          {/* Assignee */}
          <Skeleton className="h-8 w-8 rounded-full" />
          
          {/* Actions */}
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for task details drawer
 */
export function TaskDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Title */}
      <Skeleton className="h-8 w-3/4" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Fields */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      
      {/* Subtasks */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
