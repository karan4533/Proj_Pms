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