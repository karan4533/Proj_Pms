import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { like } from 'drizzle-orm';
import { users } from '../src/db/schema.js';

config({ path: '.env.local' });

async function findUser() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);
  
  const result = await db.select().from(users).where(like(users.name, '%Sathish%'));
  console.log('\n📋 User Details:\n');
  console.log(JSON.stringify(result, null, 2));
  
  await client.end();
  process.exit(0);
}

findUser();
