// Export only essential data (users, workspaces, projects, members)
const postgres = require('postgres');
const fs = require('fs');

const localDb = postgres('postgresql://postgres:admin@localhost:5432/pmsdb', { max: 1 });

// Only essential tables for login and basic functionality
const tables = [
  'users',
  'workspaces',
  'projects',
  'members'
];

async function exportData() {
  console.log('🔍 Exporting essential data from local database...\n');
  
  let insertStatements = '-- Essential data export (users, workspaces, projects, members)\n';
  insertStatements += '-- Run this in Supabase SQL Editor AFTER running final-schema.sql\n\n';
  
  try {
    for (const table of tables) {
      try {
        const data = await localDb`SELECT * FROM ${localDb(table)}`;
        
        if (data.length > 0) {
          console.log(`✓ ${table}: ${data.length} rows`);
          
          for (const row of data) {
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
            
            insertStatements += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
          }
          insertStatements += '\n';
        } else {
          console.log(`⚠ ${table}: no data`);
        }
      } catch (err) {
        console.log(`⚠ ${table}: error - ${err.message}`);
      }
    }
    
    fs.writeFileSync('users-data.sql', insertStatements);
    console.log('\n✅ Export complete! File saved as: users-data.sql');
    console.log(`\nExported ${tables.length} essential tables for login`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await localDb.end();
  }
}

exportData();
