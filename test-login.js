const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const sql = postgres('postgresql://postgres:Karanems%40123@db.ejgupmuxzuvoxmhsxplo.supabase.co:5432/postgres', {
  ssl: 'require',
});

async function testLogin() {
  try {
    console.log('Testing login for varun@pms.com...\n');
    
    // Fetch user
    const users = await sql`
      SELECT id, email, password, name 
      FROM users 
      WHERE email = 'varun@pms.com'
    `;
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ User found:', user.email);
    console.log('   Name:', user.name);
    console.log('   Password hash length:', user.password?.length || 'NULL');
    
    // Test password
    const passwordMatch = await bcrypt.compare('admin123', user.password);
    console.log('   Password match:', passwordMatch ? '✅ YES' : '❌ NO');
    
    // Check workspace membership
    const members = await sql`
      SELECT m.*, w.name as workspace_name 
      FROM members m
      JOIN workspaces w ON m.workspace_id = w.id
      WHERE m.user_id = ${user.id}
    `;
    
    console.log('\nWorkspace memberships:', members.length);
    members.forEach(m => {
      console.log('  -', m.workspace_name, '(role:', m.role + ')');
    });
    
    if (members.length === 0) {
      console.log('\n❌ PROBLEM: User has no workspace membership!');
    } else {
      console.log('\n✅ Login should work!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testLogin();
