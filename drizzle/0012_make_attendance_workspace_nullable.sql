-- Make attendance.workspace_id nullable since workspace concept is removed
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "workspace_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;
