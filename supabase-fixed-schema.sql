-- Complete Database Schema Export - FIXED with Primary Keys
-- Generated: 2025-12-29
-- Total Tables: 30

-- Drop existing tables if they exist
DROP TABLE IF EXISTS sprint_tasks CASCADE;
DROP TABLE IF EXISTS custom_field_values CASCADE;
DROP TABLE IF EXISTS task_overviews CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS bug_comments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS client_invitations CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS bugs CASCADE;
DROP TABLE IF EXISTS board_configs CASCADE;
DROP TABLE IF EXISTS board_columns CASCADE;
DROP TABLE IF EXISTS list_view_columns CASCADE;
DROP TABLE IF EXISTS custom_field_definitions CASCADE;
DROP TABLE IF EXISTS issue_type_configs CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS project_requirements CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS custom_bug_types CASCADE;
DROP TABLE IF EXISTS custom_departments CASCADE;
DROP TABLE IF EXISTS custom_designations CASCADE;

-- Table: users (MUST BE FIRST - others reference it)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text,
    mobile_no text UNIQUE,
    designation text,
    department text,
    native text,
    date_of_birth timestamp without time zone,
    date_of_joining timestamp without time zone,
    experience integer,
    skills jsonb DEFAULT '[]'::jsonb,
    image text,
    email_verified timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: verification_tokens
CREATE TABLE verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp without time zone NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Table: workspaces
CREATE TABLE workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code text NOT NULL UNIQUE,
    image_url text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: projects
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    image_url text,
    post_date timestamp without time zone,
    tentative_end_date timestamp without time zone,
    assignees jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: workflows
CREATE TABLE workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    description text,
    statuses jsonb NOT NULL,
    transitions jsonb NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: board_configs
CREATE TABLE board_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    board_type text NOT NULL DEFAULT 'KANBAN'::text,
    columns jsonb NOT NULL,
    description text,
    card_color_by text DEFAULT 'PRIORITY'::text,
    swimlanes_by text,
    filter_config jsonb,
    sprint_duration_weeks integer,
    is_favorite boolean DEFAULT false,
    created_by uuid REFERENCES users(id),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: tasks
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id text NOT NULL UNIQUE,
    summary text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'To Do'::text,
    priority text DEFAULT 'Medium'::text,
    issue_type text NOT NULL DEFAULT 'Task'::text,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    project_name text,
    assignee_id uuid REFERENCES users(id),
    reporter_id uuid REFERENCES users(id),
    creator_id uuid REFERENCES users(id),
    parent_task_id uuid REFERENCES tasks(id),
    uploaded_by uuid REFERENCES users(id),
    due_date timestamp without time zone,
    estimated_hours integer,
    actual_hours integer DEFAULT 0,
    position integer NOT NULL DEFAULT 1000,
    labels jsonb,
    custom_fields jsonb,
    resolution text,
    upload_batch_id text,
    uploaded_at timestamp without time zone,
    created timestamp without time zone NOT NULL DEFAULT now(),
    updated timestamp without time zone NOT NULL DEFAULT now(),
    resolved timestamp without time zone
);

-- Table: bugs
CREATE TABLE bugs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id text NOT NULL UNIQUE,
    bug_description text NOT NULL,
    bug_type text NOT NULL DEFAULT 'Development'::text,
    status text NOT NULL DEFAULT 'Open'::text,
    priority text DEFAULT 'Medium'::text,
    reported_by uuid NOT NULL REFERENCES users(id),
    reported_by_name text NOT NULL,
    assigned_to uuid REFERENCES users(id),
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    file_url text,
    output_file_url text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: sprints
CREATE TABLE sprints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    board_id uuid NOT NULL REFERENCES board_configs(id) ON DELETE CASCADE,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    goal text,
    state text NOT NULL DEFAULT 'FUTURE'::text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: accounts
CREATE TABLE accounts (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    type text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    PRIMARY KEY (provider, provider_account_id)
);

-- Table: sessions
CREATE TABLE sessions (
    session_token text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires timestamp without time zone NOT NULL
);

-- Table: members
CREATE TABLE members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'MEMBER'::text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: invitations
CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES users(id),
    status text NOT NULL DEFAULT 'PENDING'::text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: client_invitations
CREATE TABLE client_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES users(id),
    token text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending'::text,
    expires_at timestamp without time zone NOT NULL,
    accepted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: notifications
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    action_by uuid REFERENCES users(id),
    action_by_name text,
    is_read text NOT NULL DEFAULT 'false'::text,
    read_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: bug_comments
CREATE TABLE bug_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id uuid NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name text NOT NULL,
    comment text NOT NULL,
    file_url text,
    is_system_comment boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: attendance
CREATE TABLE attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    shift_start_time timestamp without time zone NOT NULL,
    shift_end_time timestamp without time zone,
    total_duration integer,
    status text NOT NULL DEFAULT 'IN_PROGRESS'::text,
    daily_tasks jsonb,
    end_activity text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: activity_logs
CREATE TABLE activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name text NOT NULL,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    summary text NOT NULL,
    changes jsonb,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    created_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: weekly_reports
CREATE TABLE weekly_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_date timestamp without time zone NOT NULL,
    to_date timestamp without time zone NOT NULL,
    department text NOT NULL,
    daily_descriptions jsonb NOT NULL DEFAULT '{}'::jsonb,
    uploaded_files jsonb NOT NULL DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'submitted'::text,
    is_draft text NOT NULL DEFAULT 'false'::text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: task_overviews
CREATE TABLE task_overviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    task_title text NOT NULL,
    employee_id uuid NOT NULL REFERENCES users(id),
    employee_name text NOT NULL,
    completed_work_description text NOT NULL,
    steps_followed text NOT NULL,
    completion_method text NOT NULL,
    proof_of_work jsonb NOT NULL,
    challenges text,
    additional_remarks text,
    time_spent integer,
    resolved_time text,
    resolved_date timestamp without time zone,
    status text NOT NULL DEFAULT 'PENDING'::text,
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamp without time zone,
    admin_remarks text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: custom_designations
CREATE TABLE custom_designations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamp without time zone DEFAULT now()
);

-- Table: custom_departments
CREATE TABLE custom_departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamp without time zone DEFAULT now()
);

-- Table: custom_bug_types
CREATE TABLE custom_bug_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamp without time zone DEFAULT now()
);

-- Table: custom_field_definitions
CREATE TABLE custom_field_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    field_key text NOT NULL,
    field_name text NOT NULL,
    field_type text NOT NULL,
    field_description text,
    field_options jsonb,
    default_value text,
    validation_rules jsonb,
    is_required boolean DEFAULT false,
    is_system_field boolean DEFAULT false,
    is_visible_in_list boolean DEFAULT false,
    is_visible_in_detail boolean DEFAULT true,
    is_searchable boolean DEFAULT true,
    is_filterable boolean DEFAULT true,
    display_order integer DEFAULT 1000,
    applies_to_projects jsonb,
    applies_to_issue_types jsonb,
    created_by uuid REFERENCES users(id),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, field_key)
);

-- Table: custom_field_values
CREATE TABLE custom_field_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    field_definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    value text,
    value_number integer,
    value_date timestamp without time zone,
    value_json jsonb,
    value_user_id uuid REFERENCES users(id),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    UNIQUE (task_id, field_definition_id)
);

-- Table: issue_type_configs
CREATE TABLE issue_type_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    issue_type_key text NOT NULL,
    issue_type_name text NOT NULL,
    description text,
    icon text,
    color text,
    workflow_id uuid REFERENCES workflows(id),
    is_active boolean DEFAULT true,
    is_subtask_type boolean DEFAULT false,
    display_order integer DEFAULT 1000,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, issue_type_key)
);

-- Table: board_columns
CREATE TABLE board_columns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL DEFAULT 'TODO'::text,
    position integer NOT NULL DEFAULT 0,
    color text DEFAULT '#808080'::text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: list_view_columns
CREATE TABLE list_view_columns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    field_name text NOT NULL,
    display_name text NOT NULL,
    column_type text NOT NULL DEFAULT 'text'::text,
    width integer DEFAULT 150,
    position integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,
    is_sortable boolean NOT NULL DEFAULT true,
    is_filterable boolean NOT NULL DEFAULT true,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: sprint_tasks
CREATE TABLE sprint_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id uuid NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    added_at timestamp without time zone NOT NULL DEFAULT now(),
    removed_at timestamp without time zone,
    UNIQUE (sprint_id, task_id)
);

-- Table: project_requirements
CREATE TABLE project_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tentative_title text NOT NULL,
    customer text NOT NULL,
    project_description text,
    sample_input_files jsonb DEFAULT '[]'::jsonb,
    expected_output_files jsonb DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'PENDING'::text,
    due_date timestamp without time zone,
    project_manager_id uuid REFERENCES users(id),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts (user_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS members_user_idx ON members (user_id);
CREATE INDEX IF NOT EXISTS members_workspace_idx ON members (workspace_id);
CREATE INDEX IF NOT EXISTS members_project_idx ON members (project_id);
CREATE INDEX IF NOT EXISTS tasks_workspace_idx ON tasks (workspace_id);
CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks (project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks (assignee_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
CREATE INDEX IF NOT EXISTS tasks_issue_type_idx ON tasks (issue_type);
CREATE INDEX IF NOT EXISTS bugs_workspace_idx ON bugs (workspace_id);
CREATE INDEX IF NOT EXISTS bugs_reported_by_idx ON bugs (reported_by);
CREATE INDEX IF NOT EXISTS bugs_assigned_to_idx ON bugs (assigned_to);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications (is_read);
CREATE INDEX IF NOT EXISTS activity_logs_workspace_idx ON activity_logs (workspace_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS attendance_user_idx ON attendance (user_id);
CREATE INDEX IF NOT EXISTS weekly_reports_user_idx ON weekly_reports (user_id);
CREATE INDEX IF NOT EXISTS workspaces_user_idx ON workspaces (user_id);
CREATE INDEX IF NOT EXISTS workspaces_invite_code_idx ON workspaces (invite_code);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Success message
SELECT 'All 30 tables created successfully with primary keys and foreign keys!' as status;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- IMPORTANT: These policies enable full CRUD operations including DELETE
-- Without these policies, Supabase will block DELETE operations by default
-- Generated: 2026-01-01

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Bugs
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on bugs" ON bugs FOR ALL USING (true) WITH CHECK (true);

-- Notifications (IMPORTANT: This fixes the notification delete issue)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Bug Comments
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on bug_comments" ON bug_comments FOR ALL USING (true) WITH CHECK (true);

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Weekly Reports
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on weekly_reports" ON weekly_reports FOR ALL USING (true) WITH CHECK (true);

-- Task Overviews
ALTER TABLE task_overviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on task_overviews" ON task_overviews FOR ALL USING (true) WITH CHECK (true);

-- Members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true) WITH CHECK (true);

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on invitations" ON invitations FOR ALL USING (true) WITH CHECK (true);

-- Client Invitations
ALTER TABLE client_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on client_invitations" ON client_invitations FOR ALL USING (true) WITH CHECK (true);

-- Sprints
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sprints" ON sprints FOR ALL USING (true) WITH CHECK (true);

-- Sprint Tasks
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sprint_tasks" ON sprint_tasks FOR ALL USING (true) WITH CHECK (true);

-- Board Configs
ALTER TABLE board_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on board_configs" ON board_configs FOR ALL USING (true) WITH CHECK (true);

-- Board Columns
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on board_columns" ON board_columns FOR ALL USING (true) WITH CHECK (true);

-- List View Columns
ALTER TABLE list_view_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on list_view_columns" ON list_view_columns FOR ALL USING (true) WITH CHECK (true);

-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on workflows" ON workflows FOR ALL USING (true) WITH CHECK (true);

-- Custom Field Definitions
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on custom_field_definitions" ON custom_field_definitions FOR ALL USING (true) WITH CHECK (true);

-- Custom Field Values
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on custom_field_values" ON custom_field_values FOR ALL USING (true) WITH CHECK (true);

-- Issue Type Configs
ALTER TABLE issue_type_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on issue_type_configs" ON issue_type_configs FOR ALL USING (true) WITH CHECK (true);

-- Custom Designations
ALTER TABLE custom_designations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on custom_designations" ON custom_designations FOR ALL USING (true) WITH CHECK (true);

-- Custom Departments
ALTER TABLE custom_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on custom_departments" ON custom_departments FOR ALL USING (true) WITH CHECK (true);

-- Custom Bug Types
ALTER TABLE custom_bug_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on custom_bug_types" ON custom_bug_types FOR ALL USING (true) WITH CHECK (true);

-- Project Requirements
ALTER TABLE project_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on project_requirements" ON project_requirements FOR ALL USING (true) WITH CHECK (true);

-- Auth tables (accounts, sessions, verification_tokens)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on verification_tokens" ON verification_tokens FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Final success message
SELECT 'Complete! Tables created with RLS policies. All CRUD operations (including DELETE) are enabled.' as status;
