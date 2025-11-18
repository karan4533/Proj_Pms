import { Pool } from 'pg';
import '../dotenv-config.js';

async function fixDuplicatesAndAddConstraints() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking for duplicate values...\n');
    
    // Check duplicate names
    const duplicateNames = await pool.query(`
      SELECT name, COUNT(*) as count 
      FROM users 
      WHERE name IS NOT NULL
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateNames.rows.length > 0) {
      console.log('❌ Duplicate names found:');
      duplicateNames.rows.forEach(row => {
        console.log(`  - "${row.name}" appears ${row.count} times`);
      });
    } else {
      console.log('✓ No duplicate names');
    }
    
    // Check duplicate mobile numbers
    const duplicateMobiles = await pool.query(`
      SELECT mobile_no, COUNT(*) as count 
      FROM users 
      WHERE mobile_no IS NOT NULL
      GROUP BY mobile_no 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateMobiles.rows.length > 0) {
      console.log('\n❌ Duplicate mobile numbers found:');
      duplicateMobiles.rows.forEach(row => {
        console.log(`  - "${row.mobile_no}" appears ${row.count} times`);
      });
      
      console.log('\n🔧 Setting duplicate mobile numbers to NULL...');
      for (const row of duplicateMobiles.rows) {
        // Keep the first one, set others to NULL
        await pool.query(`
          UPDATE users 
          SET mobile_no = NULL 
          WHERE mobile_no = $1 
          AND id NOT IN (
            SELECT id FROM users WHERE mobile_no = $1 ORDER BY created_at LIMIT 1
          )
        `, [row.mobile_no]);
        console.log(`  ✓ Cleared duplicates of "${row.mobile_no}"`);
      }
    } else {
      console.log('✓ No duplicate mobile numbers');
    }
    
    console.log('\n📋 Adding unique constraints...\n');
    
    // Add unique constraint to name
    try {
      await pool.query('ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE ("name");');
      console.log('✓ Added unique constraint to name');
    } catch (e: any) {
      if (e.code === '42P07') {
        console.log('⚠ Name unique constraint already exists');
      } else {
        throw e;
      }
    }
    
    // Add unique constraint to mobile_no
    try {
      await pool.query('ALTER TABLE "users" ADD CONSTRAINT "users_mobile_no_unique" UNIQUE ("mobile_no");');
      console.log('✓ Added unique constraint to mobile_no');
    } catch (e: any) {
      if (e.code === '42P07') {
        console.log('⚠ Mobile number unique constraint already exists');
      } else {
        throw e;
      }
    }
    
    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS "name_idx" ON "users" ("name");');
    console.log('✓ Created name_idx');
    
    await pool.query('CREATE INDEX IF NOT EXISTS "mobile_idx" ON "users" ("mobile_no");');
    console.log('✓ Created mobile_idx');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Name, email, and mobile number are now unique fields.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixDuplicatesAndAddConstraints();
