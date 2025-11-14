ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "native" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile_no" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "designation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_joining" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" jsonb DEFAULT '[]'::jsonb;