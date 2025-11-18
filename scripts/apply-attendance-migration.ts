import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import '../dotenv-config.js';

async function applyAttendanceMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log('Applying attendance workspace_id nullable migration...');
    
    // Drop the old constraint
    await pool.query('ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_workspace_id_workspaces_id_fk;');
    console.log('✓ Dropped old foreign key constraint');
    
    // Make column nullable
    await pool.query('ALTER TABLE attendance ALTER COLUMN workspace_id DROP NOT NULL;');
    console.log('✓ Made workspace_id nullable');
    
    // Add new constraint with SET NULL on delete
    await pool.query('ALTER TABLE attendance ADD CONSTRAINT attendance_workspace_id_workspaces_id_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;');
    console.log('✓ Added new foreign key constraint with SET NULL');
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyAttendanceMigration();
