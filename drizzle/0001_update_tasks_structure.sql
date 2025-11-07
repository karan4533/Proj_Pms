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