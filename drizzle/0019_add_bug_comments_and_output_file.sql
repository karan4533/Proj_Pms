-- Add outputFileUrl to bugs table
ALTER TABLE "bugs" ADD COLUMN "output_file_url" text;

-- Create bug_comments table for conversation history
CREATE TABLE IF NOT EXISTS "bug_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"comment" text NOT NULL,
	"file_url" text,
	"is_system_comment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_bug_id_bugs_id_fk" 
	FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "bug_comments_bug_id_idx" ON "bug_comments" ("bug_id");
CREATE INDEX IF NOT EXISTS "bug_comments_user_id_idx" ON "bug_comments" ("user_id");
CREATE INDEX IF NOT EXISTS "bug_comments_created_at_idx" ON "bug_comments" ("created_at");
