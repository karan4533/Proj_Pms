import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle(pool);

  console.log('Running migration: 0014_add_task_overviews_notifications.sql');

  try {
    const sql = readFileSync(
      join(__dirname, '../drizzle/0014_add_task_overviews_notifications.sql'),
      'utf-8'
    );

    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
