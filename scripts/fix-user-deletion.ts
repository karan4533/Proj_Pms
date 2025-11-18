import { Pool } from 'pg';
import '../dotenv-config.js';

async function applyTaskUserFKMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Applying task user foreign key constraints migration...\n');
    
    // Drop old constraints
    console.log('Dropping old foreign key constraints...');
    await pool.query('ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_assignee_id_users_id_fk";');
    console.log('✓ Dropped tasks_assignee_id_users_id_fk');
    
    await pool.query('ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_reporter_id_users_id_fk";');
    console.log('✓ Dropped tasks_reporter_id_users_id_fk');
    
    await pool.query('ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_creator_id_users_id_fk";');
    console.log('✓ Dropped tasks_creator_id_users_id_fk');
    
    await pool.query('ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_uploaded_by_users_id_fk";');
    console.log('✓ Dropped tasks_uploaded_by_users_id_fk');
    
    // Add new constraints with SET NULL on delete
    console.log('\nAdding new foreign key constraints with SET NULL...');
    await pool.query('ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;');
    console.log('✓ Added tasks_assignee_id_users_id_fk (SET NULL)');
    
    await pool.query('ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;');
    console.log('✓ Added tasks_reporter_id_users_id_fk (SET NULL)');
    
    await pool.query('ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;');
    console.log('✓ Added tasks_creator_id_users_id_fk (SET NULL)');
    
    await pool.query('ALTER TABLE "tasks" ADD CONSTRAINT "tasks_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;');
    console.log('✓ Added tasks_uploaded_by_users_id_fk (SET NULL)');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Users can now be deleted. Tasks will have their user references set to NULL.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyTaskUserFKMigration();
