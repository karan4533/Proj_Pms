-- Additional tables needed for the application

-- Attendance table
CREATE TABLE IF NOT EXISTS "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"workspace_id" uuid,
	"check_in" timestamp DEFAULT now() NOT NULL,
	"check_out" timestamp,
	"break_start" timestamp,
	"break_end" timestamp,
	"total_hours" integer DEFAULT 0,
	"status" text DEFAULT 'ACTIVE',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"entity_name" text,
	"workspace_id" uuid,
	"project_id" uuid,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text
);

-- Notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'INFO',
	"link" text,
	"read" boolean DEFAULT false,
	"workspace_id" uuid,
	"project_id" uuid,
	"task_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Weekly reports table
CREATE TABLE IF NOT EXISTS "weekly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start" timestamp NOT NULL,
	"week_end" timestamp NOT NULL,
	"accomplishments" text,
	"challenges" text,
	"plans" text,
	"status" text DEFAULT 'DRAFT',
	"is_draft" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Bugs table
CREATE TABLE IF NOT EXISTS "bugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'MEDIUM',
	"status" text DEFAULT 'OPEN',
	"priority" text DEFAULT 'MEDIUM',
	"reported_by" uuid NOT NULL,
	"assigned_to" uuid,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"environment" text,
	"steps_to_reproduce" text,
	"expected_behavior" text,
	"actual_behavior" text,
	"output_file" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Bug comments table
CREATE TABLE IF NOT EXISTS "bug_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Custom fields tables
CREATE TABLE IF NOT EXISTS "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"workspace_id" uuid,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"field_label" text NOT NULL,
	"is_required" boolean DEFAULT false,
	"options" jsonb,
	"default_value" text,
	"help_text" text,
	"validation_rules" jsonb,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"applies_to" text DEFAULT 'TASK',
	"min_value" numeric,
	"max_value" numeric,
	"min_length" integer,
	"max_length" integer,
	"pattern" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "custom_field_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_definition_id" uuid NOT NULL,
	"task_id" uuid,
	"bug_id" uuid,
	"project_id" uuid,
	"value" text,
	"numeric_value" numeric,
	"date_value" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Custom lookup tables
CREATE TABLE IF NOT EXISTS "custom_designations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"workspace_id" uuid
);

CREATE TABLE IF NOT EXISTS "custom_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"workspace_id" uuid
);

CREATE TABLE IF NOT EXISTS "custom_bug_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"workspace_id" uuid
);

-- Sprints tables
CREATE TABLE IF NOT EXISTS "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'PLANNING',
	"goal" text,
	"velocity" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sprint_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);

-- Board and workflow tables
CREATE TABLE IF NOT EXISTS "board_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"color" text,
	"wip_limit" integer,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "board_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"board_type" text DEFAULT 'KANBAN',
	"columns" jsonb,
	"swim_lanes" jsonb,
	"filters" jsonb,
	"display_settings" jsonb,
	"automation_rules" jsonb,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"states" jsonb NOT NULL,
	"transitions" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "issue_type_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"issue_type" text NOT NULL,
	"icon" text,
	"color" text,
	"fields" jsonb,
	"workflow_id" uuid,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "list_view_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid,
	"field_name" text NOT NULL,
	"display_name" text NOT NULL,
	"is_visible" boolean DEFAULT true,
	"width" integer,
	"position" integer DEFAULT 0,
	"is_sortable" boolean DEFAULT true,
	"is_filterable" boolean DEFAULT true,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Client invitations table
CREATE TABLE IF NOT EXISTS "client_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"status" text DEFAULT 'PENDING',
	"expires_at" timestamp NOT NULL,
	"access_level" text DEFAULT 'VIEW_ONLY',
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Task overviews table
CREATE TABLE IF NOT EXISTS "task_overviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"summary" text,
	"key_points" jsonb,
	"challenges" text,
	"solutions" text,
	"impact" text,
	"dependencies" jsonb,
	"risks" jsonb,
	"progress_percentage" integer DEFAULT 0,
	"last_updated_by" uuid,
	"ai_generated" boolean DEFAULT false,
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'DRAFT',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Project requirements table
CREATE TABLE IF NOT EXISTS "project_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'FUNCTIONAL',
	"priority" text DEFAULT 'MEDIUM',
	"status" text DEFAULT 'DRAFT',
	"due_date" timestamp,
	"assigned_to" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add missing columns to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='date_of_birth') THEN
    ALTER TABLE "users" ADD COLUMN "date_of_birth" date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='native') THEN
    ALTER TABLE "users" ADD COLUMN "native" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mobile_no') THEN
    ALTER TABLE "users" ADD COLUMN "mobile_no" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='designation') THEN
    ALTER TABLE "users" ADD COLUMN "designation" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department') THEN
    ALTER TABLE "users" ADD COLUMN "department" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='experience') THEN
    ALTER TABLE "users" ADD COLUMN "experience" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='date_of_joining') THEN
    ALTER TABLE "users" ADD COLUMN "date_of_joining" date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='skills') THEN
    ALTER TABLE "users" ADD COLUMN "skills" text[];
  END IF;
END $$;

-- Add missing columns to members table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='project_id') THEN
    ALTER TABLE "members" ADD COLUMN "project_id" uuid;
  END IF;
END $$;
