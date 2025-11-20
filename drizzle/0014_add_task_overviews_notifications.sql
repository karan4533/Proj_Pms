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
