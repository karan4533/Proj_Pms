import { pgTable, uuid, text, integer, timestamp, jsonb, index, uniqueIndex, boolean, decimal, varchar } from 'drizzle-orm/pg-core';

// Enhanced Users table with additional fields for better user management
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  password: text('password'),
  title: text('title'), // Job title
  department: text('department'), // Department/Team
  phoneNumber: text('phone_number'),
  timezone: text('timezone').default('UTC'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  departmentIdx: index('users_department_idx').on(table.department),
  isActiveIdx: index('users_is_active_idx').on(table.isActive),
}));

// Enhanced Workspaces table with additional metadata
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  inviteCode: text('invite_code').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  settings: jsonb('settings').default('{}'), // Workspace-level settings
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('workspaces_user_idx').on(table.userId),
  inviteCodeIdx: index('workspaces_invite_code_idx').on(table.inviteCode),
  isActiveIdx: index('workspaces_is_active_idx').on(table.isActive),
}));

// Enhanced Projects table with better categorization
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, ON_HOLD, CANCELLED
  priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),
  progress: integer('progress').default(0), // 0-100%
  tags: jsonb('tags').default('[]'),
  settings: jsonb('settings').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('projects_workspace_idx').on(table.workspaceId),
  ownerIdx: index('projects_owner_idx').on(table.ownerId),
  statusIdx: index('projects_status_idx').on(table.status),
  priorityIdx: index('projects_priority_idx').on(table.priority),
  startDateIdx: index('projects_start_date_idx').on(table.startDate),
  endDateIdx: index('projects_end_date_idx').on(table.endDate),
}));

// Epics table - High-level grouping of tasks (Parts, Service, Diagnostics, Training)
export const epics = pgTable('epics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // Parts, Service, Diagnostics, Training
  description: text('description'),
  color: text('color').default('#3B82F6'), // Hex color for UI
  icon: text('icon'), // Icon name for UI
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  status: text('status').notNull().default('ACTIVE'),
  priority: text('priority').default('MEDIUM'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours').default(0),
  progress: integer('progress').default(0),
  position: integer('position').notNull().default(1000),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('epics_project_idx').on(table.projectId),
  workspaceIdx: index('epics_workspace_idx').on(table.workspaceId),
  ownerIdx: index('epics_owner_idx').on(table.ownerId),
  statusIdx: index('epics_status_idx').on(table.status),
  positionIdx: index('epics_position_idx').on(table.position),
}));

// Enhanced Tasks table with epic relationship and better tracking
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // Story column from your data
  description: text('description'),
  status: text('status').notNull().default('TODO'), // TODO, IN_PROGRESS, IN_REVIEW, DONE
  priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  importance: text('importance').default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  type: text('type').default('TASK'), // TASK, BUG, FEATURE, STORY, EPIC
  category: text('category'), // For additional categorization
  epicId: uuid('epic_id').references(() => epics.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').notNull().references(() => users.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  
  // Time tracking
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours').default(0),
  remainingHours: integer('remaining_hours'),
  
  // Dates from your data structure
  startDate: timestamp('start_date'), // Planned Start
  dueDate: timestamp('due_date'), // Planned Completion
  completedDate: timestamp('completed_date'),
  
  // Board management
  position: integer('position').notNull().default(1000),
  
  // Additional metadata
  tags: jsonb('tags').default('[]'),
  customFields: jsonb('custom_fields').default('{}'),
  attachments: jsonb('attachments').default('[]'),
  
  // Progress tracking
  progress: integer('progress').default(0), // 0-100%
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  assigneeIdx: index('tasks_assignee_idx').on(table.assigneeId),
  reporterIdx: index('tasks_reporter_idx').on(table.reporterId),
  epicIdx: index('tasks_epic_idx').on(table.epicId),
  projectIdx: index('tasks_project_idx').on(table.projectId),
  workspaceIdx: index('tasks_workspace_idx').on(table.workspaceId),
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  typeIdx: index('tasks_type_idx').on(table.type),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
  startDateIdx: index('tasks_start_date_idx').on(table.startDate),
  positionIdx: index('tasks_position_idx').on(table.position),
  statusPositionIdx: index('tasks_status_position_idx').on(table.status, table.position),
}));

// Task Dependencies for better project management
export const taskDependencies = pgTable('task_dependencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  dependsOnTaskId: uuid('depends_on_task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('FINISH_TO_START'), // FINISH_TO_START, START_TO_START, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('task_dependencies_task_idx').on(table.taskId),
  dependsOnIdx: index('task_dependencies_depends_on_idx').on(table.dependsOnTaskId),
  uniqueDependency: uniqueIndex('task_dependencies_unique').on(table.taskId, table.dependsOnTaskId),
}));

// Comments and Activity Log
export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type').default('COMMENT'), // COMMENT, SYSTEM, STATUS_CHANGE, etc.
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('task_comments_task_idx').on(table.taskId),
  authorIdx: index('task_comments_author_idx').on(table.authorId),
  createdAtIdx: index('task_comments_created_at_idx').on(table.createdAt),
}));

// Time Logs for detailed time tracking
export const timeLogs = pgTable('time_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: text('description'),
  hoursSpent: decimal('hours_spent', { precision: 8, scale: 2 }).notNull(),
  logDate: timestamp('log_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('time_logs_task_idx').on(table.taskId),
  userIdx: index('time_logs_user_idx').on(table.userId),
  logDateIdx: index('time_logs_log_date_idx').on(table.logDate),
}));

// Board Views for different board layouts
export const boardViews = pgTable('board_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  viewType: text('view_type').notNull().default('KANBAN'), // KANBAN, CALENDAR, GANTT, LIST
  filters: jsonb('filters').default('{}'), // Saved filters
  columns: jsonb('columns').default('[]'), // Column configuration
  isDefault: boolean('is_default').default(false),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('board_views_project_idx').on(table.projectId),
  workspaceIdx: index('board_views_workspace_idx').on(table.workspaceId),
  creatorIdx: index('board_views_creator_idx').on(table.creatorId),
  viewTypeIdx: index('board_views_view_type_idx').on(table.viewType),
}));

// Dashboards for analytics and reporting
export const dashboards = pgTable('dashboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  layout: jsonb('layout').notNull(), // Dashboard widget layout
  widgets: jsonb('widgets').notNull(), // Widget configurations
  isDefault: boolean('is_default').default(false),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('dashboards_workspace_idx').on(table.workspaceId),
  creatorIdx: index('dashboards_creator_idx').on(table.creatorId),
}));

// Notifications for better communication
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // TASK_ASSIGNED, DUE_DATE_REMINDER, etc.
  entityType: text('entity_type'), // TASK, PROJECT, WORKSPACE
  entityId: uuid('entity_id'),
  isRead: boolean('is_read').default(false),
  actionUrl: text('action_url'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  typeIdx: index('notifications_type_idx').on(table.type),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// Keep existing tables for compatibility
export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (table) => ({
  userIdx: index('accounts_user_idx').on(table.userId),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
}));

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
});

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('MEMBER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('members_user_idx').on(table.userId),
  workspaceIdx: index('members_workspace_idx').on(table.workspaceId),
  userWorkspaceIdx: index('members_user_workspace_idx').on(table.userId, table.workspaceId),
}));

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  invitedBy: uuid('invited_by').notNull().references(() => users.id),
  status: text('status').notNull().default('PENDING'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('invitations_email_idx').on(table.email),
  workspaceIdx: index('invitations_workspace_idx').on(table.workspaceId),
  statusIdx: index('invitations_status_idx').on(table.status),
}));