// Task related types based on the new database structure

export type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Cancelled' | 'On Hold';

export type TaskPriority = 'High' | 'Medium' | 'Low' | 'Critical';

export type IssueType = 'Task' | 'Bug' | 'Epic' | 'Story' | 'Sub-task' | 'Improvement';

export type Resolution = 'Done' | 'Won\'t Fix' | 'Duplicate' | 'Cannot Reproduce' | 'Incomplete' | 'Fixed';

export interface Task {
  id: string;
  summary: string;
  issueId: string; // e.g., VECV-601
  issueType: IssueType;
  status: TaskStatus;
  projectName: string; // e.g., VECV-SPINE
  priority: TaskPriority;
  resolution?: Resolution;
  assigneeId?: string;
  reporterId?: string;
  creatorId?: string;
  created: Date;
  updated: Date;
  resolved?: Date;
  dueDate?: Date;
  labels?: string[]; // Array of label strings
  description?: string;
  
  // Relationships
  projectId?: string;
  workspaceId: string;
  
  // Additional fields
  estimatedHours?: number;
  actualHours: number;
  position: number;
}

export interface CreateTaskData {
  summary: string;
  issueId: string;
  issueType: IssueType;
  status?: TaskStatus;
  projectName: string;
  priority?: TaskPriority;
  assigneeId?: string;
  reporterId?: string;
  dueDate?: Date;
  labels?: string[];
  description?: string;
  projectId?: string;
  workspaceId: string;
  estimatedHours?: number;
}

export interface UpdateTaskData {
  id: string;
  summary?: string;
  issueType?: IssueType;
  status?: TaskStatus;
  projectName?: string;
  priority?: TaskPriority;
  resolution?: Resolution;
  assigneeId?: string;
  reporterId?: string;
  dueDate?: Date;
  labels?: string[];
  description?: string;
  estimatedHours?: number;
  actualHours?: number;
  position?: number;
}

// For task filtering and searching
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  issueType?: IssueType[];
  assigneeId?: string[];
  reporterId?: string[];
  creatorId?: string[];
  projectName?: string[];
  labels?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}

// For task statistics and analytics
export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byIssueType: Record<IssueType, number>;
  byProject: Record<string, number>;
  overdueTasks: number;
  completedThisWeek: number;
  averageCompletionTime?: number; // in days
}