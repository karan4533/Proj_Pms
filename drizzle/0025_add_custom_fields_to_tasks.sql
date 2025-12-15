-- Add custom_fields column to tasks table for storing dynamic column data
ALTER TABLE "tasks" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb;

-- Create index for custom fields queries
CREATE INDEX IF NOT EXISTS "tasks_custom_fields_idx" ON "tasks" USING GIN ("custom_fields");

-- Add comment to describe the column
COMMENT ON COLUMN "tasks"."custom_fields" IS 'Stores dynamic custom column data as JSON key-value pairs';
