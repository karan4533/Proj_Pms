import { Pool } from 'pg';
import '../dotenv-config.js';

async function addUniqueConstraints() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding unique constraints to name and mobile_no columns...\n');
    
    // Add unique constraint to name
    console.log('Adding unique constraint to name...');
    await pool.query('ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE ("name");');
    console.log('✓ Added unique constraint to name');
    
    // Add unique constraint to mobile_no
    console.log('Adding unique constraint to mobile_no...');
    await pool.query('ALTER TABLE "users" ADD CONSTRAINT "users_mobile_no_unique" UNIQUE ("mobile_no");');
    console.log('✓ Added unique constraint to mobile_no');
    
    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS "name_idx" ON "users" ("name");');
    console.log('✓ Created name_idx');
    
    await pool.query('CREATE INDEX IF NOT EXISTS "mobile_idx" ON "users" ("mobile_no");');
    console.log('✓ Created mobile_idx');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Name, email, and mobile number are now unique fields.');
  } catch (error: any) {
    if (error.code === '23505') {
      console.error('❌ Migration failed: Duplicate values exist in the database');
      console.error('Please ensure all names and mobile numbers are unique before applying this migration.');
    } else {
      console.error('❌ Migration failed:', error);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

addUniqueConstraints();
