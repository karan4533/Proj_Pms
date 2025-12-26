-- Complete database schema - ALL TABLES
-- Copy this ENTIRE file and run in Supabase SQL Editor

-- Add missing columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS native text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_no text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_joining date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text[];

-- Add missing column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS project_id uuid;

-- Create ALL remaining tables
CREATE TABLE IF NOT EXISTS attendance (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, project_id uuid REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE, check_in timestamp DEFAULT now() NOT NULL, check_out timestamp, break_start timestamp, break_end timestamp, total_hours integer DEFAULT 0, status text DEFAULT 'ACTIVE', notes text, created_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS activity_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_name text NOT NULL, action text NOT NULL, entity_type text NOT NULL, entity_id uuid, entity_name text, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE, project_id uuid REFERENCES projects(id) ON DELETE CASCADE, details jsonb, created_at timestamp DEFAULT now() NOT NULL, ip_address text);

CREATE TABLE IF NOT EXISTS notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, title text NOT NULL, message text NOT NULL, type text DEFAULT 'INFO', link text, read boolean DEFAULT false, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE, project_id uuid REFERENCES projects(id) ON DELETE CASCADE, task_id uuid REFERENCES tasks(id) ON DELETE CASCADE, created_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS weekly_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, week_start timestamp NOT NULL, week_end timestamp NOT NULL, accomplishments text, challenges text, plans text, status text DEFAULT 'DRAFT', is_draft boolean DEFAULT true, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS bugs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text, severity text DEFAULT 'MEDIUM', status text DEFAULT 'OPEN', priority text DEFAULT 'MEDIUM', reported_by uuid NOT NULL REFERENCES users(id), assigned_to uuid REFERENCES users(id), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, environment text, steps_to_reproduce text, expected_behavior text, actual_behavior text, output_file text, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS bug_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bug_id uuid NOT NULL REFERENCES bugs(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, comment text NOT NULL, attachments jsonb, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS custom_field_definitions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE, field_name text NOT NULL, field_type text NOT NULL, field_label text NOT NULL, is_required boolean DEFAULT false, options jsonb, default_value text, help_text text, validation_rules jsonb, display_order integer DEFAULT 0, is_active boolean DEFAULT true, applies_to text DEFAULT 'TASK', min_value numeric, max_value numeric, min_length integer, max_length integer, pattern text, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS custom_field_values (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), field_definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE, task_id uuid REFERENCES tasks(id) ON DELETE CASCADE, bug_id uuid REFERENCES bugs(id) ON DELETE CASCADE, project_id uuid REFERENCES projects(id) ON DELETE CASCADE, value text, numeric_value numeric, date_value timestamp, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS custom_designations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS custom_departments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS custom_bug_types (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS sprints (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, start_date timestamp NOT NULL, end_date timestamp NOT NULL, status text DEFAULT 'PLANNING', goal text, velocity integer DEFAULT 0, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS sprint_tasks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sprint_id uuid NOT NULL REFERENCES sprints(id) ON DELETE CASCADE, task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, added_at timestamp DEFAULT now() NOT NULL, removed_at timestamp);

CREATE TABLE IF NOT EXISTS board_columns (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, name text NOT NULL, position integer NOT NULL, color text, wip_limit integer, is_default boolean DEFAULT false, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS board_configs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, board_type text DEFAULT 'KANBAN', columns jsonb, swim_lanes jsonb, filters jsonb, display_settings jsonb, automation_rules jsonb, permissions jsonb, is_active boolean DEFAULT true, created_by uuid REFERENCES users(id), created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS workflows (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, states jsonb NOT NULL, transitions jsonb NOT NULL, is_default boolean DEFAULT false, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS issue_type_configs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, issue_type text NOT NULL, icon text, color text, fields jsonb, workflow_id uuid REFERENCES workflows(id), is_active boolean DEFAULT true, is_default boolean DEFAULT false, display_order integer DEFAULT 0, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS list_view_columns (id text PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE, field_name text NOT NULL, display_name text NOT NULL, is_visible boolean DEFAULT true, width integer, position integer DEFAULT 0, is_sortable boolean DEFAULT true, is_filterable boolean DEFAULT true, is_system boolean DEFAULT false, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS client_invitations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, invited_by uuid NOT NULL REFERENCES users(id), status text DEFAULT 'PENDING', expires_at timestamp NOT NULL, access_level text DEFAULT 'VIEW_ONLY', accepted_at timestamp, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS task_overviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, summary text, key_points jsonb, challenges text, solutions text, impact text, dependencies jsonb, risks jsonb, progress_percentage integer DEFAULT 0, last_updated_by uuid REFERENCES users(id), ai_generated boolean DEFAULT false, version integer DEFAULT 1, status text DEFAULT 'DRAFT', published_at timestamp, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);

CREATE TABLE IF NOT EXISTS project_requirements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title text NOT NULL, description text, type text DEFAULT 'FUNCTIONAL', priority text DEFAULT 'MEDIUM', status text DEFAULT 'DRAFT', due_date timestamp, assigned_to uuid REFERENCES users(id), created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);
