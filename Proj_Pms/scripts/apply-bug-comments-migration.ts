import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function applyMigration() {
  console.log("⏳ Applying bug comments and output file migration...");

  try {
    // Add outputFileUrl column to bugs table
    await db.execute(`
      ALTER TABLE "bugs" ADD COLUMN IF NOT EXISTS "output_file_url" text;
    `);
    console.log("✅ Added output_file_url column to bugs table");

    // Create bug_comments table
    await db.execute(`
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
    `);
    console.log("✅ Created bug_comments table");

    // Add foreign key constraints
    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'bug_comments_bug_id_bugs_id_fk'
        ) THEN
          ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_bug_id_bugs_id_fk" 
            FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);

    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'bug_comments_user_id_users_id_fk'
        ) THEN
          ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_user_id_users_id_fk" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log("✅ Added foreign key constraints");

    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS "bug_comments_bug_id_idx" ON "bug_comments" ("bug_id");
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS "bug_comments_user_id_idx" ON "bug_comments" ("user_id");
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS "bug_comments_created_at_idx" ON "bug_comments" ("created_at");
    `);
    console.log("✅ Created indexes");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

applyMigration()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
