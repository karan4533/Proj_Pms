import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema.js';
import { eq, ne } from 'drizzle-orm';

const { users } = schema;

config({ path: '.env.local' });

async function getAllEmployees() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    console.log('🔍 Fetching all users...\n');

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(`📊 Total users: ${allUsers.length}\n`);

    allUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
    });

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await client.end();
    process.exit(1);
  }
}

getAllEmployees();
