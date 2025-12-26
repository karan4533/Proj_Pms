// Quick script to initialize Supabase database
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Karanems@123@db.ejgupmuxzuvoxmhsxplo.supabase.co:6543/postgres';

async function runMigrations() {
  console.log('🔌 Connecting to Supabase...');
  
  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Connected successfully!');
    
    // Read and run the first migration
    const migrationPath = path.join(__dirname, 'drizzle', '0000_shocking_dark_beast.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📦 Running initial schema...');
    
    // Split by statement breakpoint and run each statement
    const statements = migrationSQL.split('--> statement-breakpoint').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement.trim());
          console.log('✓ Statement executed');
        } catch (err) {
          if (!err.message.includes('already exists')) {
            throw err;
          }
          console.log('⚠ Table already exists, skipping');
        }
      }
    }
    
    console.log('🎉 Database schema initialized!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit https://ems-ggs.vercel.app');
    console.log('2. Try logging in or creating an account');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
