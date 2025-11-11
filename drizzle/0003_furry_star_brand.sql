ALTER TABLE "tasks" ADD COLUMN "upload_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "uploaded_by" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_upload_batch_idx" ON "tasks" USING btree ("upload_batch_id");--> statement-breakpoint
CREATE INDEX "tasks_workspace_created_idx" ON "tasks" USING btree ("workspace_id","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_status_created_idx" ON "tasks" USING btree ("workspace_id","status","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_assignee_created_idx" ON "tasks" USING btree ("workspace_id","assignee_id","created");--> statement-breakpoint
CREATE INDEX "tasks_workspace_duedate_created_idx" ON "tasks" USING btree ("workspace_id","due_date","created");