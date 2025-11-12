ALTER TABLE "attendance" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "start_activity" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "end_activity" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_project_idx" ON "attendance" USING btree ("project_id");