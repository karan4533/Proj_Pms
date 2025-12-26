const postgres = require('postgres');

const sql = postgres('postgresql://postgres:admin@localhost:5432/pmsdb', { max: 1 });

async function findVarun() {
  try {
    const users = await sql`SELECT * FROM users WHERE name ILIKE '%varun%' OR email ILIKE '%varun%'`;
    
    if (users.length === 0) {
      console.log('No user found with name or email containing "varun"');
      return;
    }
    
    console.log(`Found ${users.length} user(s):\n`);
    
    for (const u of users) {
      const cols = Object.keys(u);
      const vals = cols.map(c => {
        const v = u[c];
        if (v === null) return 'NULL';
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        if (v instanceof Date) return `'${v.toISOString()}'`;
        if (typeof v === 'boolean') return v;
        if (Array.isArray(v)) {
          if (v.length === 0) return 'ARRAY[]::text[]';
          return `ARRAY[${v.map(x => `'${x}'`).join(',')}]`;
        }
        if (typeof v === 'object') return `'${JSON.stringify(v)}'::jsonb`;
        return v;
      });
      
      console.log(`INSERT INTO "users" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

findVarun();
