// Export data from local PostgreSQL to Supabase
const postgres = require('postgres');
const fs = require('fs');

const localDb = postgres('postgresql://postgres:admin@localhost:5432/pmsdb', { max: 1 });

const tables = [
  'users',
  'workspaces',
  'projects',
  'members',
  'tasks',
  'invitations',
  'sessions',
  'accounts',
  'verification_tokens',
  'attendance',
  'activity_logs',
  'notifications',
  'weekly_reports',
  'bugs',
  'bug_comments',
  'custom_field_definitions',
  'custom_field_values',
  'custom_designations',
  'custom_departments',
  'custom_bug_types',
  'sprints',
  'sprint_tasks',
  'board_columns',
  'board_configs',
  'workflows',
  'issue_type_configs',
  'list_view_columns',
  'client_invitations',
  'task_overviews',
  'project_requirements'
];

async function exportData() {
  console.log('🔍 Exporting data from local database...\n');
  
  let insertStatements = '-- Data export from local database\n';
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
        console.log(`⚠ ${table}: table doesn't exist or error - ${err.message}`);
      }
    }
    
    fs.writeFileSync('data-export.sql', insertStatements);
    console.log('\n✅ Export complete! File saved as: data-export.sql');
    console.log('\nNext steps:');
    console.log('1. Open data-export.sql');
    console.log('2. Copy all contents');
    console.log('3. Paste in Supabase SQL Editor and run');
    console.log('4. Your users and all data will be available!');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await localDb.end();
  }
}

exportData();
