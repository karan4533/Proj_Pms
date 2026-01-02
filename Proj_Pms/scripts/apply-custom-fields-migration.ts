import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function applyMigration() {
  try {
    console.log("🔄 Adding custom_fields column to tasks table...");
    
    // Add custom_fields column
    await db.execute(sql`
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "custom_fields" jsonb DEFAULT '{}'::jsonb
    `);
    
    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "tasks_custom_fields_idx" ON "tasks" USING GIN ("custom_fields")
    `);
    
    console.log("✅ Migration completed successfully");
    console.log("   - Added custom_fields jsonb column");
    console.log("   - Created GIN index for custom_fields");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();
