DROP INDEX "attendance_user_workspace_idx";--> statement-breakpoint
DROP INDEX "attendance_start_time_idx";--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "shift_start_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "shift_end_time" timestamp;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "total_duration" integer;--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "attendance" USING btree ("shift_start_time");--> statement-breakpoint
CREATE INDEX "attendance_user_date_idx" ON "attendance" USING btree ("user_id","shift_start_time");--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "duration";