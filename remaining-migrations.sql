
-- Migration: 0001_update_tasks_structure.sql

-- Migration to update tasks table structure to match the new requirements

-- First, backup existing data if needed
-- CREATE TABLE tasks_backup AS SELECT * FROM tasks;

-- Drop existing tasks table (be careful - this will delete all existing task data)
DROP TABLE IF EXISTS tasks CASCADE;

-- Recreate tasks table with new structure
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary TEXT NOT NULL,
    issue_id TEXT UNIQUE NOT NULL, -- e.g., VECV-601
    issue_type TEXT NOT NULL DEFAULT 'Task', -- Task, Bug, Epic, Story, etc.
    status TEXT NOT NULL DEFAULT 'To Do', -- To Do, In Progress, Done, etc.
    project_name TEXT NOT NULL, -- e.g., VECV-SPINE
    priority TEXT DEFAULT 'Medium', -- High, Medium, Low
    resolution TEXT, -- Done, Won't Fix, Duplicate, etc.
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    creator_id UUID REFERENCES users(id),
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    updated TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved TIMESTAMP,
    due_date TIMESTAMP,
    labels JSONB, -- Array of labels as JSON
    description TEXT,
    
    -- Keep existing relationships
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Additional fields that might be useful
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 1000
);

-- Create indexes for better performance
CREATE INDEX tasks_issue_id_idx ON tasks(issue_id);
CREATE INDEX tasks_assignee_idx ON tasks(assignee_id);
CREATE INDEX tasks_reporter_idx ON tasks(reporter_id);
CREATE INDEX tasks_creator_idx ON tasks(creator_id);
CREATE INDEX tasks_project_idx ON tasks(project_id);
CREATE INDEX tasks_workspace_idx ON tasks(workspace_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
CREATE INDEX tasks_project_name_idx ON tasks(project_name);
CREATE INDEX tasks_issue_type_idx ON tasks(issue_type);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);

-- Migration: 0002_clean_bill_hollister.sql

-- Backup existing tasks if needed
-- CREATE TABLE tasks_backup AS SELECT * FROM tasks;

-- Drop existing tasks table completely
DROP TABLE IF EXISTS "tasks" CASCADE;--> statement-breakpoint

-- Recreate tasks table with new structure
CREATE TABLE "tasks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "summary" text NOT NULL,
    "issue_id" text NOT NULL UNIQUE,
    "issue_type" text DEFAULT 'Task' NOT NULL,
    "status" text DEFAULT 'To Do' NOT NULL,
    "project_name" text NOT NULL,
    "priority" text DEFAULT 'Medium',
    "resolution" text,
    "assignee_id" uuid,
    "reporter_id" uuid,
    "creator_id" uuid,
    "created" timestamp DEFAULT now() NOT NULL,
    "updated" timestamp DEFAULT now() NOT NULL,
    "resolved" timestamp,
    "due_date" timestamp,
    "labels" jsonb,
    "description" text,
    "project_id" uuid,
    "workspace_id" uuid NOT NULL,
    "estimated_hours" integer,
    "actual_hours" integer DEFAULT 0,
    "position" integer DEFAULT 1000 NOT NULL
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Create indexes
CREATE INDEX "tasks_issue_id_idx" ON "tasks" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_reporter_idx" ON "tasks" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "tasks_creator_idx" ON "tasks" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tasks_project_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_workspace_idx" ON "tasks" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_project_name_idx" ON "tasks" USING btree ("project_name");--> statement-breakpoint
CREATE INDEX "tasks_issue_type_idx" ON "tasks" USING btree ("issue_type");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");

-- Migration: 0003_change_upload_batch_id_to_text.sql

-- Change upload_batch_id column type from UUID to TEXT
ALTER TABLE "tasks" ALTER COLUMN "upload_batch_id" TYPE TEXT;


-- Migration: 0003_furry_star_brand.sql

ALTER TABLE "tasks" ADD COLUMN "upload_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "uploaded_by" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_upload_batch_idx" ON "tasks" USING btree ("upload_batch_id");--> statement-breakpoint
CREATE INDEX "tasks_workspace_created_idx" ON "tasks" USING btree ("workspace_id","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_status_created_idx" ON "tasks" USING btree ("workspace_id","status","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_assignee_created_idx" ON "tasks" USING btree ("workspace_id","assignee_id","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_duedate_created_idx" ON "tasks" USING btree ("workspace_id","due_date","created");

-- Migration: 0004_handy_boomerang.sql

CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"daily_tasks" jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_user_idx" ON "attendance" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "attendance_workspace_idx" ON "attendance" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "attendance_user_workspace_idx" ON "attendance" USING btree ("user_id","workspace_id");--> statement-breakpoint
CREATE INDEX "attendance_start_time_idx" ON "attendance" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "attendance_status_idx" ON "attendance" USING btree ("status");

-- Migration: 0005_hard_moira_mactaggert.sql

DROP INDEX "attendance_user_workspace_idx";--> statement-breakpoint
DROP INDEX "attendance_start_time_idx";--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "shift_start_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "shift_end_time" timestamp;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "total_duration" integer;--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "attendance" USING btree ("shift_start_time");--> statement-breakpoint
CREATE INDEX "attendance_user_date_idx" ON "attendance" USING btree ("user_id","shift_start_time");--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "duration";

-- Migration: 0006_superb_mephistopheles.sql

ALTER TABLE "attendance" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "start_activity" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "end_activity" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_project_idx" ON "attendance" USING btree ("project_id");

-- Migration: 0007_awesome_lilith.sql

ALTER TABLE "attendance" DROP COLUMN "start_activity";

-- Migration: 0008_common_raza.sql

ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "native" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile_no" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "designation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_joining" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" jsonb DEFAULT '[]'::jsonb;

-- Migration: 0009_awesome_mentallo.sql

ALTER TABLE "users" ADD COLUMN "department" text;

-- Migration: 0010_smooth_zombie.sql

ALTER TABLE "projects" ADD COLUMN "post_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tentative_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "assignees" jsonb DEFAULT '[]'::jsonb;

-- Migration: 0011_fix_custom_designations.sql

-- Drop the incorrectly created custom_designations table
DROP TABLE IF EXISTS "custom_designations" CASCADE;

-- Recreate custom_designations table with correct structure
CREATE TABLE "custom_designations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text UNIQUE NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create index
CREATE INDEX "custom_designations_name_idx" ON "custom_designations" ("name");


-- Migration: 0012_make_attendance_workspace_nullable.sql

-- Make attendance.workspace_id nullable since workspace concept is removed
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "workspace_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;


-- Migration: 0012_tough_ma_gnuci.sql

ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_reporter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- Migration: 0013_colorful_centennial.sql

CREATE INDEX "name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "mobile_idx" ON "users" USING btree ("mobile_no");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mobile_no_unique" UNIQUE("mobile_no");

-- Migration: 0014_add_activity_logs.sql

-- Migration: Add activity_logs table for Jira-style activity tracking
-- Created: 2025-11-19

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "action_type" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "user_name" text NOT NULL,
  "workspace_id" uuid,
  "project_id" uuid,
  "task_id" uuid,
  "changes" jsonb,
  "summary" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "activity_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
  CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL,
  CONSTRAINT "activity_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS "activity_logs_entity_idx" ON "activity_logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "activity_logs_user_idx" ON "activity_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "activity_logs_workspace_idx" ON "activity_logs" ("workspace_id");
CREATE INDEX IF NOT EXISTS "activity_logs_task_idx" ON "activity_logs" ("task_id");
CREATE INDEX IF NOT EXISTS "activity_logs_project_idx" ON "activity_logs" ("project_id");
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "activity_logs_action_type_idx" ON "activity_logs" ("action_type");
CREATE INDEX IF NOT EXISTS "activity_logs_workspace_created_idx" ON "activity_logs" ("workspace_id", "created_at");

-- Add comment
COMMENT ON TABLE "activity_logs" IS 'Jira-style comprehensive activity tracking for all entity changes';


-- Migration: 0014_add_custom_departments.sql

-- Migration: Add custom_departments table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS "custom_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "custom_departments_name_idx" ON "custom_departments" ("name");


-- Migration: 0014_add_task_overviews_notifications.sql

-- Add task_overviews table for completion workflow
CREATE TABLE IF NOT EXISTS "task_overviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"completed_work_description" text NOT NULL,
	"completion_method" text NOT NULL,
	"steps_followed" text NOT NULL,
	"proof_of_work" jsonb NOT NULL,
	"challenges" text,
	"additional_remarks" text,
	"time_spent" integer,
	"task_title" text NOT NULL,
	"employee_name" text NOT NULL,
	"resolved_date" timestamp,
	"resolved_time" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"admin_remarks" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_by" uuid,
	"action_by_name" text,
	"is_read" text DEFAULT 'false' NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints for task_overviews
DO $$ BEGIN
 ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints for notifications
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_action_by_users_id_fk" FOREIGN KEY ("action_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for task_overviews
CREATE INDEX IF NOT EXISTS "task_overviews_task_idx" ON "task_overviews" ("task_id");
CREATE INDEX IF NOT EXISTS "task_overviews_employee_idx" ON "task_overviews" ("employee_id");
CREATE INDEX IF NOT EXISTS "task_overviews_status_idx" ON "task_overviews" ("status");
CREATE INDEX IF NOT EXISTS "task_overviews_reviewer_idx" ON "task_overviews" ("reviewed_by");
CREATE UNIQUE INDEX IF NOT EXISTS "task_overviews_task_unique_idx" ON "task_overviews" ("task_id");

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_task_idx" ON "notifications" ("task_id");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" ("is_read");
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" ("user_id","is_read","created_at");


-- Migration: 0014_groovy_dark_beast.sql

CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"workspace_id" uuid,
	"project_id" uuid,
	"task_id" uuid,
	"changes" jsonb,
	"summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"color" text DEFAULT '#808080',
	"category" text DEFAULT 'TODO' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid,
	"name" text NOT NULL,
	"board_type" text DEFAULT 'KANBAN' NOT NULL,
	"description" text,
	"columns" jsonb NOT NULL,
	"filter_config" jsonb,
	"card_color_by" text DEFAULT 'PRIORITY',
	"swimlanes_by" text,
	"sprint_duration_weeks" integer,
	"is_favorite" boolean DEFAULT false,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bug_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"comment" text NOT NULL,
	"file_url" text,
	"is_system_comment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" text NOT NULL,
	"assigned_to" uuid,
	"bug_type" text DEFAULT 'Development' NOT NULL,
	"bug_description" text NOT NULL,
	"file_url" text,
	"output_file_url" text,
	"status" text DEFAULT 'Open' NOT NULL,
	"priority" text DEFAULT 'Medium',
	"reported_by" uuid NOT NULL,
	"reported_by_name" text NOT NULL,
	"workspace_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bugs_bug_id_unique" UNIQUE("bug_id")
);
--> statement-breakpoint
CREATE TABLE "client_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "custom_bug_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_bug_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "custom_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"field_name" text NOT NULL,
	"field_key" text NOT NULL,
	"field_type" text NOT NULL,
	"field_description" text,
	"is_required" boolean DEFAULT false,
	"default_value" text,
	"field_options" jsonb,
	"validation_rules" jsonb,
	"applies_to_issue_types" jsonb,
	"applies_to_projects" jsonb,
	"display_order" integer DEFAULT 1000,
	"is_visible_in_list" boolean DEFAULT false,
	"is_visible_in_detail" boolean DEFAULT true,
	"is_searchable" boolean DEFAULT true,
	"is_filterable" boolean DEFAULT true,
	"is_system_field" boolean DEFAULT false,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"field_definition_id" uuid NOT NULL,
	"value" text,
	"value_number" integer,
	"value_date" timestamp,
	"value_user_id" uuid,
	"value_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_type_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"issue_type_name" text NOT NULL,
	"issue_type_key" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"is_subtask_type" boolean DEFAULT false,
	"workflow_id" uuid,
	"display_order" integer DEFAULT 1000,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_view_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"project_id" uuid,
	"field_name" text NOT NULL,
	"display_name" text NOT NULL,
	"column_type" text DEFAULT 'text' NOT NULL,
	"width" integer DEFAULT 150,
	"position" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_sortable" boolean DEFAULT true NOT NULL,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_by" uuid,
	"action_by_name" text,
	"is_read" text DEFAULT 'false' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprint_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"state" text DEFAULT 'FUTURE' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_overviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"completed_work_description" text NOT NULL,
	"completion_method" text NOT NULL,
	"steps_followed" text NOT NULL,
	"proof_of_work" jsonb NOT NULL,
	"challenges" text,
	"additional_remarks" text,
	"time_spent" integer,
	"task_title" text NOT NULL,
	"employee_name" text NOT NULL,
	"resolved_date" timestamp,
	"resolved_time" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"admin_remarks" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"from_date" timestamp NOT NULL,
	"to_date" timestamp NOT NULL,
	"department" text NOT NULL,
	"daily_descriptions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"is_draft" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"statuses" jsonb NOT NULL,
	"transitions" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "project_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "project_requirements" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_configs" ADD CONSTRAINT "board_configs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_configs" ADD CONSTRAINT "board_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_configs" ADD CONSTRAINT "board_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_bug_id_bugs_id_fk" FOREIGN KEY ("bug_id") REFERENCES "public"."bugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_field_definition_id_custom_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_value_user_id_users_id_fk" FOREIGN KEY ("value_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_type_configs" ADD CONSTRAINT "issue_type_configs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_view_columns" ADD CONSTRAINT "list_view_columns_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_view_columns" ADD CONSTRAINT "list_view_columns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_action_by_users_id_fk" FOREIGN KEY ("action_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_tasks" ADD CONSTRAINT "sprint_tasks_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_tasks" ADD CONSTRAINT "sprint_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_board_id_board_configs_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_overviews" ADD CONSTRAINT "task_overviews_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_workspace_idx" ON "activity_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "activity_logs_task_idx" ON "activity_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "activity_logs_project_idx" ON "activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_logs_action_type_idx" ON "activity_logs" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "activity_logs_workspace_created_idx" ON "activity_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "board_columns_workspace_idx" ON "board_columns" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "board_columns_position_idx" ON "board_columns" USING btree ("position");--> statement-breakpoint
CREATE INDEX "board_configs_workspace_idx" ON "board_configs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "board_configs_project_idx" ON "board_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "bug_comments_bug_id_idx" ON "bug_comments" USING btree ("bug_id");--> statement-breakpoint
CREATE INDEX "bug_comments_user_id_idx" ON "bug_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bug_comments_created_at_idx" ON "bug_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bugs_bug_id_idx" ON "bugs" USING btree ("bug_id");--> statement-breakpoint
CREATE INDEX "bugs_assigned_to_idx" ON "bugs" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "bugs_bug_type_idx" ON "bugs" USING btree ("bug_type");--> statement-breakpoint
CREATE INDEX "bugs_status_idx" ON "bugs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bugs_reported_by_idx" ON "bugs" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "bugs_workspace_idx" ON "bugs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "bugs_created_at_idx" ON "bugs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "client_invitations_email_idx" ON "client_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "client_invitations_project_idx" ON "client_invitations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "client_invitations_token_idx" ON "client_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "client_invitations_status_idx" ON "client_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "custom_bug_types_name_idx" ON "custom_bug_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "custom_departments_name_idx" ON "custom_departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "custom_field_definitions_workspace_idx" ON "custom_field_definitions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "custom_field_definitions_field_key_idx" ON "custom_field_definitions" USING btree ("field_key");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_field_unique_key_per_workspace" ON "custom_field_definitions" USING btree ("workspace_id","field_key");--> statement-breakpoint
CREATE INDEX "custom_field_values_task_idx" ON "custom_field_values" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "custom_field_values_field_definition_idx" ON "custom_field_values" USING btree ("field_definition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_field_value_unique_per_task" ON "custom_field_values" USING btree ("task_id","field_definition_id");--> statement-breakpoint
CREATE INDEX "issue_type_configs_workspace_idx" ON "issue_type_configs" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_type_unique_key_per_workspace" ON "issue_type_configs" USING btree ("workspace_id","issue_type_key");--> statement-breakpoint
CREATE INDEX "list_view_columns_workspace_idx" ON "list_view_columns" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "list_view_columns_project_idx" ON "list_view_columns" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "list_view_columns_project_position_idx" ON "list_view_columns" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_task_idx" ON "notifications" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "sprint_tasks_sprint_idx" ON "sprint_tasks" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "sprint_tasks_task_idx" ON "sprint_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sprint_task_unique" ON "sprint_tasks" USING btree ("sprint_id","task_id");--> statement-breakpoint
CREATE INDEX "sprints_workspace_idx" ON "sprints" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "sprints_board_idx" ON "sprints" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "sprints_state_idx" ON "sprints" USING btree ("state");--> statement-breakpoint
CREATE INDEX "task_overviews_task_idx" ON "task_overviews" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_overviews_employee_idx" ON "task_overviews" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "task_overviews_status_idx" ON "task_overviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_overviews_reviewer_idx" ON "task_overviews" USING btree ("reviewed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "task_overviews_task_unique_idx" ON "task_overviews" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "weekly_reports_user_idx" ON "weekly_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "weekly_reports_department_idx" ON "weekly_reports" USING btree ("department");--> statement-breakpoint
CREATE INDEX "weekly_reports_from_date_idx" ON "weekly_reports" USING btree ("from_date");--> statement-breakpoint
CREATE INDEX "weekly_reports_to_date_idx" ON "weekly_reports" USING btree ("to_date");--> statement-breakpoint
CREATE INDEX "weekly_reports_created_at_idx" ON "weekly_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "weekly_reports_is_draft_idx" ON "weekly_reports" USING btree ("is_draft");--> statement-breakpoint
CREATE INDEX "workflows_workspace_idx" ON "workflows" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "members_project_idx" ON "members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "requirements_due_date_idx" ON "project_requirements" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_parent_task_idx" ON "tasks" USING btree ("parent_task_id");

-- Migration: 0015_make_project_name_nullable.sql

-- Make project_name nullable for individual tasks
ALTER TABLE "tasks" ALTER COLUMN "project_name" DROP NOT NULL;


-- Migration: 0016_add_weekly_reports.sql


-- Migration: 0017_add_auto_completed_status.sql

-- Add AUTO_COMPLETED status support
-- Update existing auto-ended records to use the new status
UPDATE attendance 
SET status = 'AUTO_COMPLETED' 
WHERE status = 'COMPLETED' 
AND end_activity LIKE '%automatically ended at midnight%';

-- The status column already accepts text, so no ALTER needed
-- Just documenting the new possible value: IN_PROGRESS, COMPLETED, AUTO_COMPLETED


-- Migration: 0017_add_is_draft_to_weekly_reports.sql

-- Add isDraft column to weekly_reports table
ALTER TABLE "weekly_reports" ADD COLUMN "is_draft" text DEFAULT 'false' NOT NULL;

-- Create index on isDraft column for better query performance
CREATE INDEX IF NOT EXISTS "weekly_reports_is_draft_idx" ON "weekly_reports" ("is_draft");


-- Migration: 0017_add_weekly_reports_table.sql

-- Add weekly_reports table for employee weekly report submissions
CREATE TABLE IF NOT EXISTS "weekly_reports" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL,
  "from_date" TIMESTAMP NOT NULL,
  "to_date" TIMESTAMP NOT NULL,
  "department" TEXT NOT NULL,
  "daily_descriptions" JSONB NOT NULL DEFAULT '{}',
  "uploaded_files" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "weekly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "weekly_reports_user_id_idx" ON "weekly_reports" ("user_id");
CREATE INDEX IF NOT EXISTS "weekly_reports_department_idx" ON "weekly_reports" ("department");
CREATE INDEX IF NOT EXISTS "weekly_reports_from_date_idx" ON "weekly_reports" ("from_date");
CREATE INDEX IF NOT EXISTS "weekly_reports_to_date_idx" ON "weekly_reports" ("to_date");
CREATE INDEX IF NOT EXISTS "weekly_reports_created_at_idx" ON "weekly_reports" ("created_at");


-- Migration: 0018_add_bug_tracker.sql

-- Create custom bug types table
CREATE TABLE IF NOT EXISTS "custom_bug_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);

-- Create bug tracker table
CREATE TABLE IF NOT EXISTS "bugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" text NOT NULL UNIQUE,
	"assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"bug_type" text NOT NULL DEFAULT 'Development',
	"bug_description" text NOT NULL,
	"file_url" text,
	"status" text NOT NULL DEFAULT 'Open',
	"priority" text DEFAULT 'Medium',
	"reported_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"reported_by_name" text NOT NULL,
	"workspace_id" uuid REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "bugs_bug_id_idx" ON "bugs" ("bug_id");
CREATE INDEX IF NOT EXISTS "bugs_assigned_to_idx" ON "bugs" ("assigned_to");
CREATE INDEX IF NOT EXISTS "bugs_bug_type_idx" ON "bugs" ("bug_type");
CREATE INDEX IF NOT EXISTS "bugs_status_idx" ON "bugs" ("status");
CREATE INDEX IF NOT EXISTS "bugs_reported_by_idx" ON "bugs" ("reported_by");
CREATE INDEX IF NOT EXISTS "bugs_workspace_idx" ON "bugs" ("workspace_id");
CREATE INDEX IF NOT EXISTS "bugs_created_at_idx" ON "bugs" ("created_at");
CREATE INDEX IF NOT EXISTS "custom_bug_types_name_idx" ON "custom_bug_types" ("name");

-- Insert default bug types
INSERT INTO "custom_bug_types" ("name") VALUES ('UI/UX'), ('Development'), ('Testing')
ON CONFLICT (name) DO NOTHING;


-- Migration: 0019_add_bug_comments_and_output_file.sql

-- Add outputFileUrl to bugs table
ALTER TABLE "bugs" ADD COLUMN "output_file_url" text;

-- Create bug_comments table for conversation history
CREATE TABLE IF NOT EXISTS "bug_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"comment" text NOT NULL,
	"file_url" text,
	"is_system_comment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_bug_id_bugs_id_fk" 
	FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "bug_comments_bug_id_idx" ON "bug_comments" ("bug_id");
CREATE INDEX IF NOT EXISTS "bug_comments_user_id_idx" ON "bug_comments" ("user_id");
CREATE INDEX IF NOT EXISTS "bug_comments_created_at_idx" ON "bug_comments" ("created_at");


-- Migration: 0020_add_custom_fields.sql

-- Custom field definitions table (similar to Jira's custom fields)
CREATE TABLE IF NOT EXISTS "custom_field_definitions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "field_name" TEXT NOT NULL, -- e.g., "Sprint", "Story Points", "Epic Link"
  "field_key" TEXT NOT NULL, -- e.g., "sprint", "story_points", "epic_link" (for API/DB usage)
  "field_type" TEXT NOT NULL, -- TEXT, NUMBER, DATE, SELECT, MULTI_SELECT, USER, CHECKBOX, URL, etc.
  "field_description" TEXT,
  "is_required" BOOLEAN DEFAULT FALSE,
  "default_value" TEXT,
  
  -- Configuration for different field types
  "field_options" JSONB, -- For SELECT/MULTI_SELECT: {options: ["Option 1", "Option 2"]}
  "validation_rules" JSONB, -- {min: 0, max: 100, pattern: "^[A-Z]", etc}
  
  -- Applicability
  "applies_to_issue_types" JSONB, -- Array of issue types: ["Task", "Bug", "Story", "Epic"]
  "applies_to_projects" JSONB, -- Array of project IDs (null means all projects)
  
  -- UI Configuration
  "display_order" INTEGER DEFAULT 1000,
  "is_visible_in_list" BOOLEAN DEFAULT FALSE, -- Show in task list/table
  "is_visible_in_detail" BOOLEAN DEFAULT TRUE, -- Show in detail view
  "is_searchable" BOOLEAN DEFAULT TRUE,
  "is_filterable" BOOLEAN DEFAULT TRUE,
  
  -- System fields
  "is_system_field" BOOLEAN DEFAULT FALSE, -- True for built-in fields like Priority, Status
  "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT "custom_field_unique_key_per_workspace" UNIQUE ("workspace_id", "field_key")
);

-- Custom field values table (stores actual values for each task)
CREATE TABLE IF NOT EXISTS "custom_field_values" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" UUID NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "field_definition_id" UUID NOT NULL REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE,
  "value" TEXT, -- String value for simple types
  "value_number" NUMERIC, -- Numeric value
  "value_date" TIMESTAMP, -- Date value
  "value_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL, -- User reference value
  "value_json" JSONB, -- Complex values (arrays, objects, multi-select)
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT "custom_field_value_unique_per_task" UNIQUE ("task_id", "field_definition_id")
);

-- Issue type configurations (like Jira's issue type schemes)
CREATE TABLE IF NOT EXISTS "issue_type_configs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "issue_type_name" TEXT NOT NULL, -- Task, Bug, Story, Epic, Sub-task, etc.
  "issue_type_key" TEXT NOT NULL, -- task, bug, story, epic (for API usage)
  "description" TEXT,
  "icon" TEXT, -- Icon name or emoji
  "color" TEXT, -- Hex color code
  "is_subtask_type" BOOLEAN DEFAULT FALSE,
  "workflow_id" UUID, -- Reference to workflow (future enhancement)
  "display_order" INTEGER DEFAULT 1000,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT "issue_type_unique_key_per_workspace" UNIQUE ("workspace_id", "issue_type_key")
);

-- Workflow definitions (Jira-like workflows)
CREATE TABLE IF NOT EXISTS "workflows" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "statuses" JSONB NOT NULL, -- Array of status objects: [{key: "todo", name: "To Do", category: "TODO"}, ...]
  "transitions" JSONB NOT NULL, -- Workflow transitions: [{from: "todo", to: "in_progress", name: "Start Progress"}, ...]
  "is_default" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Board configurations (Kanban/Scrum boards)
CREATE TABLE IF NOT EXISTS "board_configs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "board_type" TEXT NOT NULL DEFAULT 'KANBAN', -- KANBAN, SCRUM
  "description" TEXT,
  
  -- Column configuration
  "columns" JSONB NOT NULL, -- Array of column configs: [{id, name, status_mapping: [], limit: 5}]
  
  -- Filter configuration
  "filter_config" JSONB, -- {issue_types: [], assignees: [], etc}
  
  -- Display settings
  "card_color_by" TEXT DEFAULT 'PRIORITY', -- PRIORITY, ISSUE_TYPE, ASSIGNEE, CUSTOM_FIELD
  "swimlanes_by" TEXT, -- NONE, ASSIGNEE, PRIORITY, EPIC, CUSTOM_FIELD
  
  -- Scrum specific
  "sprint_duration_weeks" INTEGER,
  
  "is_favorite" BOOLEAN DEFAULT FALSE,
  "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Sprints table (for Scrum boards)
CREATE TABLE IF NOT EXISTS "sprints" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "board_id" UUID NOT NULL REFERENCES "board_configs"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "goal" TEXT,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "state" TEXT NOT NULL DEFAULT 'FUTURE', -- FUTURE, ACTIVE, CLOSED
  "completed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Sprint task assignments
CREATE TABLE IF NOT EXISTS "sprint_tasks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sprint_id" UUID NOT NULL REFERENCES "sprints"("id") ON DELETE CASCADE,
  "task_id" UUID NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "added_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "removed_at" TIMESTAMP,
  
  CONSTRAINT "sprint_task_unique" UNIQUE ("sprint_id", "task_id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "custom_field_definitions_workspace_idx" ON "custom_field_definitions"("workspace_id");
CREATE INDEX IF NOT EXISTS "custom_field_definitions_field_key_idx" ON "custom_field_definitions"("field_key");
CREATE INDEX IF NOT EXISTS "custom_field_values_task_idx" ON "custom_field_values"("task_id");
CREATE INDEX IF NOT EXISTS "custom_field_values_field_definition_idx" ON "custom_field_values"("field_definition_id");
CREATE INDEX IF NOT EXISTS "issue_type_configs_workspace_idx" ON "issue_type_configs"("workspace_id");
CREATE INDEX IF NOT EXISTS "workflows_workspace_idx" ON "workflows"("workspace_id");
CREATE INDEX IF NOT EXISTS "board_configs_workspace_idx" ON "board_configs"("workspace_id");
CREATE INDEX IF NOT EXISTS "board_configs_project_idx" ON "board_configs"("project_id");
CREATE INDEX IF NOT EXISTS "sprints_workspace_idx" ON "sprints"("workspace_id");
CREATE INDEX IF NOT EXISTS "sprints_board_idx" ON "sprints"("board_id");
CREATE INDEX IF NOT EXISTS "sprints_state_idx" ON "sprints"("state");
CREATE INDEX IF NOT EXISTS "sprint_tasks_sprint_idx" ON "sprint_tasks"("sprint_id");
CREATE INDEX IF NOT EXISTS "sprint_tasks_task_idx" ON "sprint_tasks"("task_id");

-- Insert default system field definitions for each workspace
-- (This would be done via application code when workspace is created)

-- Example: Insert default issue types
INSERT INTO "issue_type_configs" ("workspace_id", "issue_type_name", "issue_type_key", "description", "icon", "color", "display_order")
SELECT 
  w.id,
  issue_types.name,
  issue_types.key,
  issue_types.description,
  issue_types.icon,
  issue_types.color,
  issue_types.display_order
FROM "workspaces" w
CROSS JOIN (
  VALUES 
    ('Task', 'task', 'A unit of work to be completed', 'âœ“', '#4BADE8', 1),
    ('Bug', 'bug', 'A problem that impairs functionality', 'ðŸ›', '#E5493A', 2),
    ('Story', 'story', 'A user story or feature request', 'ðŸ“–', '#63BA3C', 3),
    ('Epic', 'epic', 'A large body of work', 'âš¡', '#904EE2', 4),
    ('Sub-task', 'subtask', 'A smaller task within a task', 'ðŸ“‹', '#6B778C', 5)
) AS issue_types(name, key, description, icon, color, display_order)
ON CONFLICT ("workspace_id", "issue_type_key") DO NOTHING;


-- Migration: 0022_add_parent_task_id.sql

-- Add parent_task_id column to tasks table for hierarchical relationships
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" uuid;

-- Add foreign key constraint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" 
  FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;

-- Create index for parent_task_id
CREATE INDEX IF NOT EXISTS "tasks_parent_task_idx" ON "tasks" ("parent_task_id");


-- Migration: 0023_create_board_columns.sql

-- Create board_columns table for dynamic Jira-style columns
CREATE TABLE IF NOT EXISTS "board_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"color" text DEFAULT '#808080',
	"category" text DEFAULT 'TODO' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_workspace_id_workspaces_id_fk" 
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes
CREATE INDEX IF NOT EXISTS "board_columns_workspace_idx" ON "board_columns" ("workspace_id");
CREATE INDEX IF NOT EXISTS "board_columns_position_idx" ON "board_columns" ("position");
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_column_unique" ON "board_columns" ("workspace_id","name");

-- Insert default columns for existing workspaces
INSERT INTO "board_columns" ("workspace_id", "name", "position", "color", "category", "is_default")
SELECT 
  id as workspace_id,
  'To Do' as name,
  0 as position,
  '#6B7280' as color,
  'TODO' as category,
  true as is_default
FROM "workspaces"
ON CONFLICT DO NOTHING;

INSERT INTO "board_columns" ("workspace_id", "name", "position", "color", "category", "is_default")
SELECT 
  id as workspace_id,
  'In Progress' as name,
  1 as position,
  '#3B82F6' as color,
  'IN_PROGRESS' as category,
  true as is_default
FROM "workspaces"
ON CONFLICT DO NOTHING;

INSERT INTO "board_columns" ("workspace_id", "name", "position", "color", "category", "is_default")
SELECT 
  id as workspace_id,
  'Done' as name,
  2 as position,
  '#10B981' as color,
  'DONE' as category,
  true as is_default
FROM "workspaces"
ON CONFLICT DO NOTHING;


-- Migration: 0024_add_list_view_columns.sql

-- Create list_view_columns table for dynamic column configuration
CREATE TABLE IF NOT EXISTS "list_view_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"field_name" text NOT NULL, -- The task field this column maps to (e.g., 'issueId', 'summary', 'status')
	"display_name" text NOT NULL, -- Display name shown in header (e.g., 'Key', 'Summary', 'Status')
	"column_type" text NOT NULL DEFAULT 'text', -- text, select, user, date, labels, priority, etc.
	"width" integer DEFAULT 150, -- Column width in pixels
	"position" integer NOT NULL DEFAULT 0, -- Order of columns
	"is_visible" boolean NOT NULL DEFAULT true, -- Show/hide column
	"is_sortable" boolean NOT NULL DEFAULT true, -- Can column be sorted
	"is_filterable" boolean NOT NULL DEFAULT true, -- Can column be filtered
	"is_system" boolean NOT NULL DEFAULT false, -- System columns can't be deleted
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "list_view_columns" ADD CONSTRAINT "list_view_columns_workspace_id_workspaces_id_fk" 
FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "list_view_columns_workspace_idx" ON "list_view_columns" ("workspace_id");
CREATE INDEX IF NOT EXISTS "list_view_columns_position_idx" ON "list_view_columns" ("workspace_id", "position");

-- Insert default columns for existing workspaces
INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'issueId' as field_name,
	'Key' as display_name,
	'text' as column_type,
	100 as width,
	0 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	true as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'issueId'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'issueType' as field_name,
	'Type' as display_name,
	'select' as column_type,
	80 as width,
	1 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	true as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'issueType'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'summary' as field_name,
	'Summary' as display_name,
	'text' as column_type,
	300 as width,
	2 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	true as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'summary'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'status' as field_name,
	'Status' as display_name,
	'select' as column_type,
	120 as width,
	3 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	true as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'status'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'priority' as field_name,
	'Priority' as display_name,
	'priority' as column_type,
	100 as width,
	4 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	true as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'priority'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'assigneeId' as field_name,
	'Assignee' as display_name,
	'user' as column_type,
	120 as width,
	5 as position,
	true as is_visible,
	false as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'assigneeId'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'labels' as field_name,
	'Labels' as display_name,
	'labels' as column_type,
	150 as width,
	6 as position,
	true as is_visible,
	false as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'labels'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'dueDate' as field_name,
	'Due Date' as display_name,
	'date' as column_type,
	120 as width,
	7 as position,
	true as is_visible,
	true as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'dueDate'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'created' as field_name,
	'Created' as display_name,
	'date' as column_type,
	120 as width,
	8 as position,
	false as is_visible,
	true as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'created'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'updated' as field_name,
	'Updated' as display_name,
	'date' as column_type,
	120 as width,
	9 as position,
	false as is_visible,
	true as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'updated'
);

INSERT INTO "list_view_columns" ("workspace_id", "field_name", "display_name", "column_type", "width", "position", "is_visible", "is_sortable", "is_filterable", "is_system")
SELECT 
	w."id" as workspace_id,
	'reporterId' as field_name,
	'Reporter' as display_name,
	'user' as column_type,
	120 as width,
	10 as position,
	false as is_visible,
	false as is_sortable,
	true as is_filterable,
	false as is_system
FROM "workspaces" w
WHERE NOT EXISTS (
	SELECT 1 FROM "list_view_columns" lvc WHERE lvc.workspace_id = w.id AND lvc.field_name = 'reporterId'
);


-- Migration: 0025_add_custom_fields_to_tasks.sql

-- Add custom_fields column to tasks table for storing dynamic column data
ALTER TABLE "tasks" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb;

-- Create index for custom fields queries
CREATE INDEX IF NOT EXISTS "tasks_custom_fields_idx" ON "tasks" USING GIN ("custom_fields");

-- Add comment to describe the column
COMMENT ON COLUMN "tasks"."custom_fields" IS 'Stores dynamic custom column data as JSON key-value pairs';


-- Migration: 0026_add_client_invitations.sql

-- Add projectId column to members table for CLIENT role scoping
ALTER TABLE "members" ADD COLUMN "project_id" uuid REFERENCES "projects"("id") ON DELETE CASCADE;

-- Create index for project-scoped members
CREATE INDEX "members_project_idx" ON "members"("project_id");

-- Create client_invitations table for secure email invitations
CREATE TABLE IF NOT EXISTS "client_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"invited_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"token" text NOT NULL UNIQUE,
	"status" text NOT NULL DEFAULT 'pending',
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for client_invitations
CREATE INDEX "client_invitations_email_idx" ON "client_invitations"("email");
CREATE INDEX "client_invitations_project_idx" ON "client_invitations"("project_id");
CREATE INDEX "client_invitations_token_idx" ON "client_invitations"("token");
CREATE INDEX "client_invitations_status_idx" ON "client_invitations"("status");


-- Migration: 0026_make_columns_project_specific.sql

-- Make list_view_columns project-specific instead of workspace-specific
-- This allows each project to have its own custom columns

-- Add projectId column (nullable initially)
ALTER TABLE "list_view_columns" ADD COLUMN "project_id" UUID;

-- Add foreign key to projects
ALTER TABLE "list_view_columns" ADD CONSTRAINT "list_view_columns_project_id_projects_id_fk" 
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

-- Update workspaceId to be nullable (for project-specific columns)
ALTER TABLE "list_view_columns" ALTER COLUMN "workspace_id" DROP NOT NULL;

-- Create new index for project-based queries
CREATE INDEX IF NOT EXISTS "list_view_columns_project_idx" ON "list_view_columns" ("project_id");
CREATE INDEX IF NOT EXISTS "list_view_columns_project_position_idx" ON "list_view_columns" ("project_id", "position");

-- Drop old workspace-only indexes (keep workspace_idx for backward compatibility)
DROP INDEX IF EXISTS "list_view_columns_position_idx";

