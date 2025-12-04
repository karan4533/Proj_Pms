import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, or, and, isNotNull } from "drizzle-orm";
import * as schema from "../src/db/schema";

// Load environment variables
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create database connection
const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function fixBugResolvedDates() {
  console.log("🔍 Checking for bugs with incorrect resolved_at dates...");

  try {
    // Find bugs that have resolvedAt but status is not Resolved or Closed
    const incorrectBugs = await db
      .select()
      .from(schema.bugs)
      .where(
        and(
          isNotNull(schema.bugs.resolvedAt),
          or(
            eq(schema.bugs.status, "Open"),
            eq(schema.bugs.status, "In Progress")
          )
        )
      );

    if (incorrectBugs.length === 0) {
      console.log("✅ No bugs with incorrect resolved_at dates found.");
      await client.end();
      return;
    }

    console.log(`📝 Found ${incorrectBugs.length} bugs with incorrect resolved_at dates.`);
    
    for (const bug of incorrectBugs) {
      console.log(`   - ${bug.bugId}: Status is "${bug.status}" but has resolved_at set`);
    }

    // Clear resolvedAt for bugs that are Open or In Progress
    const result = await db
      .update(schema.bugs)
      .set({ resolvedAt: null, updatedAt: new Date() })
      .where(
        and(
          isNotNull(schema.bugs.resolvedAt),
          or(
            eq(schema.bugs.status, "Open"),
            eq(schema.bugs.status, "In Progress")
          )
        )
      )
      .returning();

    console.log(`\n✅ Fixed ${result.length} bugs - cleared resolved_at for non-resolved statuses.`);
    
    await client.end();
  } catch (error) {
    console.error("❌ Error fixing bug resolved dates:", error);
    await client.end();
    throw error;
  }
}

// Run the fix
fixBugResolvedDates()
  .then(() => {
    console.log("\n🎉 Bug resolved dates fix completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error:", error);
    process.exit(1);
  });
