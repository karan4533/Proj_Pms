export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  IN_REVIEW = "IN_REVIEW",
  DONE = "Done",
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export enum IssueType {
  TASK = "Task",
  BUG = "Bug",
  EPIC = "Epic",
  STORY = "Story",
  SUB_TASK = "Sub-task",
  IMPROVEMENT = "Improvement",
}

export enum Resolution {
  DONE = "Done",
  WONT_FIX = "Won't Fix",
  DUPLICATE = "Duplicate",
  CANNOT_REPRODUCE = "Cannot Reproduce",
  INCOMPLETE = "Incomplete",
  FIXED = "Fixed",
}

export type Task = {
  id: string;
  summary: string;
  issueId: string;
  issueType: IssueType;
  status: TaskStatus;
  projectName: string;
  priority: TaskPriority;
  resolution?: Resolution;
  assigneeId?: string;
  reporterId?: string;
  creatorId?: string;
  created: string;
  updated: string;
  resolved?: string;
  dueDate?: string;
  labels?: string[];
  description?: string;
  projectId?: string;
  workspaceId: string;
  estimatedHours?: number;
  actualHours: number;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type ExcelTaskData = {
  summary: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  issueType: IssueType;
  dueDate?: string;
  projectName: string;
  estimatedHours?: number;
  assigneeEmail?: string;
  labels?: string[];
};
