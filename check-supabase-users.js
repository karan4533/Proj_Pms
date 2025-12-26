const postgres = require('postgres');

const sql = postgres('postgresql://postgres:Karanems@123@db.ejgupmuxzuvoxmhsxplo.supabase.co:5432/postgres', {
  max: 1,
  ssl: 'require'
});

async function checkUsers() {
  try {
    console.log('🔍 Checking Supabase users table...\n');
    
    const users = await sql`SELECT id, name, email FROM users LIMIT 20`;
    
    if (users.length === 0) {
      console.log('❌ NO USERS FOUND in Supabase!');
      console.log('\n📝 ACTION REQUIRED:');
      console.log('1. Open 10-users.sql file');
      console.log('2. Copy all content (Ctrl+A, Ctrl+C)');
      console.log('3. Go to Supabase Dashboard → SQL Editor');
      console.log('4. Paste and click "Run"');
    } else {
      console.log(`✅ Found ${users.length} users in Supabase:\n`);
      users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name} (${u.email})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('relation "users" does not exist')) {
      console.log('\n⚠️  The "users" table does not exist!');
      console.log('You need to run the schema first:');
      console.log('1. Open final-schema.sql');
      console.log('2. Copy and run in Supabase SQL Editor');
      console.log('3. Then run 10-users.sql');
    }
  } finally {
    await sql.end();
  }
}

checkUsers();
