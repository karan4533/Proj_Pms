ALTER TABLE "projects" ADD COLUMN "post_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tentative_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "assignees" jsonb DEFAULT '[]'::jsonb;