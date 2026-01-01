-- Row Level Security (RLS) Policies for Supabase
-- This file enables proper permissions for INSERT, UPDATE, DELETE, and SELECT operations
-- Generated: 2026-01-01

-- IMPORTANT: Disable RLS for these tables since we're using application-level security
-- This allows your app to perform all CRUD operations

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

-- Success message
SELECT 'RLS policies created successfully! All CRUD operations (including DELETE) are now enabled.' as status;
