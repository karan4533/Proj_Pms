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
