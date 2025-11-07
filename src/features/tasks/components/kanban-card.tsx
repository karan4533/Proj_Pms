import { MoreHorizontalIcon, TagIcon, UserIcon, CalendarIcon, Clock, CheckCircleIcon } from "lucide-react";

import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";

import { Task } from "../types";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  // Helper function to format date and time
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to determine due date status
  const getDueDateStatus = (dueDate: string | undefined) => {
    if (!dueDate) return 'none';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'soon';
    return 'normal';
  };

  // Parse labels from JSON string
  const labels = task.labels ? (Array.isArray(task.labels) ? task.labels : JSON.parse(task.labels || '[]')) : [];
  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <div className={`bg-white p-3 mb-2 rounded-lg shadow-sm border space-y-3 hover:shadow-md transition-shadow ${
      dueDateStatus === 'overdue' ? 'border-red-300 bg-red-50' : 
      dueDateStatus === 'urgent' ? 'border-orange-300 bg-orange-50' : 
      dueDateStatus === 'soon' ? 'border-yellow-300 bg-yellow-50' : 
      'border-gray-100'
    }`}>
      {/* Header with Issue ID, Priority, and Actions */}
      <div className="flex items-start justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <Badge variant="outline" className="text-xs font-mono px-1.5 py-0.5">
            {task.issueId}
          </Badge>
          <Badge 
            variant={task.priority === 'High' || task.priority === 'Critical' ? 'destructive' : 'secondary'}
            className="text-xs px-1.5 py-0.5"
          >
            {task.priority}
          </Badge>
        </div>
        <TaskActions id={task.id} projectId={task.projectId || ""}>
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
        </TaskActions>
      </div>

      {/* Task Summary (main content) */}
      <div className="space-y-1">
        <p className="text-sm font-medium line-clamp-2 text-gray-900">{task.summary}</p>
        <div className="flex items-center gap-x-1 text-xs text-gray-500">
          <span>{task.issueType}</span>
          {task.projectName && (
            <>
              <div className="size-1 rounded-full bg-gray-300" />
              <span>{task.projectName}</span>
            </>
          )}
        </div>
      </div>

      <DottedSeparator />

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <TagIcon className="size-3 text-gray-400 mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {labels.slice(0, 3).map((label: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                {label}
              </Badge>
            ))}
            {labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-gray-50">
                +{labels.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Assignee and Reporter */}
      <div className="flex items-center gap-x-2">
        {task.assignee ? (
          <div className="flex items-center gap-x-1.5">
            <MemberAvatar
              name={task.assignee?.name || ''}
              fallbackClassName="text-[10px]"
            />
            <span className="text-xs text-gray-600 truncate">{task.assignee?.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-x-1.5 text-gray-400">
            <UserIcon className="size-4" />
            <span className="text-xs">Unassigned</span>
          </div>
        )}
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex items-center gap-x-1.5 text-xs ${
          dueDateStatus === 'overdue' ? 'text-red-600 font-medium' :
          dueDateStatus === 'urgent' ? 'text-orange-600 font-medium' :
          dueDateStatus === 'soon' ? 'text-yellow-600 font-medium' :
          'text-gray-600'
        }`}>
          <CalendarIcon className={`size-3 ${
            dueDateStatus === 'overdue' ? 'text-red-500' :
            dueDateStatus === 'urgent' ? 'text-orange-500' :
            dueDateStatus === 'soon' ? 'text-yellow-500' :
            'text-gray-400'
          }`} />
          <TaskDate value={task.dueDate || ""} className="text-xs" />
          {dueDateStatus === 'overdue' && <Badge variant="destructive" className="text-xs px-1 py-0">Overdue</Badge>}
          {dueDateStatus === 'urgent' && <Badge variant="destructive" className="text-xs px-1 py-0 bg-orange-500">Due Soon</Badge>}
        </div>
      )}

      {/* Resolution Status */}
      {task.resolution && (
        <div className="flex items-center gap-x-1.5">
          <CheckCircleIcon className="size-3 text-green-500" />
          <span className="text-xs text-green-600 font-medium">{task.resolution}</span>
        </div>
      )}

      {/* Project Info */}
      {task.project && (
        <div className="flex items-center gap-x-1.5">
          <ProjectAvatar
            name={task.project?.name || ''}
            image={task.project?.imageUrl || undefined}
            fallbackClassName="text-[10px]"
          />
          <span className="text-xs font-medium text-gray-700">{task.project?.name}</span>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-1 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-x-1.5 text-xs text-gray-500">
          <Clock className="size-3" />
          <span>Created: {formatDateTime(task.created)}</span>
        </div>
        {task.updated !== task.created && (
          <div className="flex items-center gap-x-1.5 text-xs text-gray-500">
            <Clock className="size-3" />
            <span>Updated: {formatDateTime(task.updated)}</span>
          </div>
        )}
        {task.resolved && (
          <div className="flex items-center gap-x-1.5 text-xs text-green-600">
            <CheckCircleIcon className="size-3" />
            <span>Resolved: {formatDateTime(task.resolved)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
