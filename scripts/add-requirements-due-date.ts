import { Pool } from 'pg';
import '../dotenv-config.js';

async function addDueDateColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding due_date column to project_requirements table...\n');
    
    // Add due_date column
    await pool.query('ALTER TABLE "project_requirements" ADD COLUMN IF NOT EXISTS "due_date" timestamp;');
    console.log('✓ Added due_date column');
    
    // Create index on due_date
    await pool.query('CREATE INDEX IF NOT EXISTS "requirements_due_date_idx" ON "project_requirements" ("due_date");');
    console.log('✓ Created index on due_date');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Due date field is now available in project requirements.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addDueDateColumn();
