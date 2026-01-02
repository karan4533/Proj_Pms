import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema.js';
import { sql } from "drizzle-orm";

const { bugComments } = schema;

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixCommentFileUrls() {
  console.log("Checking for comments with invalid file URLs...");

  // Find all comments with file URLs
  const comments = await db
    .select()
    .from(bugComments)
    .where(sql`${bugComments.fileUrl} IS NOT NULL`);

  console.log(`Found ${comments.length} comments with file URLs`);

  for (const comment of comments) {
    console.log(`\nComment ID: ${comment.id}`);
    console.log(`User: ${comment.userName}`);
    console.log(`Created: ${comment.createdAt}`);
    console.log(`Comment: ${comment.comment.substring(0, 50)}...`);
    console.log(`File URL: ${comment.fileUrl?.substring(0, 100)}...`);
    
    // Check if it's a valid base64 data URL
    if (comment.fileUrl && !comment.fileUrl.startsWith('data:')) {
      console.log(`❌ INVALID: This file URL is not a base64 data URL!`);
      console.log(`   It appears to be a path/filename: ${comment.fileUrl}`);
      console.log(`   This comment needs to be deleted and recreated with the file properly uploaded.`);
    } else {
      console.log(`✅ VALID: File URL is properly formatted`);
    }
  }

  console.log("\n=== Summary ===");
  console.log("Comments with invalid file URLs need to be deleted and recreated.");
  console.log("To delete a specific comment, you can run:");
  console.log("DELETE FROM bug_comments WHERE id = 'comment-id-here';");
}

fixCommentFileUrls()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
