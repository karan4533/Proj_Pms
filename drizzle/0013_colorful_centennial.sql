CREATE INDEX "name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "mobile_idx" ON "users" USING btree ("mobile_no");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mobile_no_unique" UNIQUE("mobile_no");