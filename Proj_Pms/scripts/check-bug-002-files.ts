import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema.js';
import { eq } from "drizzle-orm";

const { bugs } = schema;

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function checkBugFiles() {
  console.log("Checking BUG-002 file attachment...\n");

  const [bug] = await db
    .select()
    .from(bugs)
    .where(eq(bugs.bugId, 'BUG-002'))
    .limit(1);

  if (!bug) {
    console.log("BUG-002 not found!");
    return;
  }

  console.log(`Bug ID: ${bug.bugId}`);
  console.log(`Bug Type: ${bug.bugType}`);
  console.log(`Status: ${bug.status}`);
  console.log(`\nFile URL: ${bug.fileUrl?.substring(0, 100)}...`);
  console.log(`File URL length: ${bug.fileUrl?.length || 0}`);
  console.log(`Starts with 'data:': ${bug.fileUrl?.startsWith('data:')}`);
  
  if (bug.fileUrl && !bug.fileUrl.startsWith('data:')) {
    console.log(`\n❌ INVALID: Main bug attachment is not a base64 data URL!`);
    console.log(`   Value: ${bug.fileUrl}`);
  } else if (bug.fileUrl) {
    console.log(`\n✅ VALID: Main bug attachment is properly formatted`);
  } else {
    console.log(`\n⚠️  No file attachment on this bug`);
  }
  
  console.log(`\nOutput File URL: ${bug.outputFileUrl?.substring(0, 100) || 'None'}...`);
  if (bug.outputFileUrl) {
    console.log(`Output File URL length: ${bug.outputFileUrl.length}`);
    console.log(`Starts with 'data:': ${bug.outputFileUrl.startsWith('data:')}`);
    
    if (!bug.outputFileUrl.startsWith('data:')) {
      console.log(`\n❌ INVALID: Output file is not a base64 data URL!`);
    } else {
      console.log(`\n✅ VALID: Output file is properly formatted`);
    }
  }
}

checkBugFiles()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
