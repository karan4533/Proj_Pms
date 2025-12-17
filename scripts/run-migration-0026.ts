import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

async function migrate() {
  const sql = readFileSync('./drizzle/0026_make_columns_project_specific.sql', 'utf-8');
  
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  
  try {
    console.log('🔄 Running migration...');
    await client.unsafe(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch(console.error);
