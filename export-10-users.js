// Export only 10 users for login
const postgres = require('postgres');
const fs = require('fs');

const localDb = postgres('postgresql://postgres:admin@localhost:5432/pmsdb', { max: 1 });

async function exportData() {
  console.log('🔍 Exporting 10 users from local database...\n');
  
  let insertStatements = '-- 10 users for login\n';
  insertStatements += '-- Run this in Supabase SQL Editor\n\n';
  
  try {
    const users = await localDb`SELECT * FROM users LIMIT 10`;
    
    console.log(`✓ Exporting ${users.length} users`);
    
    for (const row of users) {
      const columns = Object.keys(row);
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'boolean') return val;
        if (Array.isArray(val)) {
          if (val.length === 0) return 'ARRAY[]::text[]';
          return `ARRAY[${val.map(v => `'${v}'`).join(',')}]`;
        }
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      });
      
      insertStatements += `INSERT INTO "users" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
    
    fs.writeFileSync('10-users.sql', insertStatements);
    console.log('\n✅ Export complete! File saved as: 10-users.sql');
    console.log('\nUsers exported:');
    users.forEach(u => console.log(`  - ${u.email}`));
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await localDb.end();
  }
}

exportData();
