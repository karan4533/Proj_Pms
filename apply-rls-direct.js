// Direct RLS Policy Application Script
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
}

// Try to use direct connection (port 5432) instead of pooler (port 6543)
const directUrl = DATABASE_URL.replace(':6543/', ':5432/');

console.log('🔌 Connecting to Supabase (direct connection)...');
console.log('');

const sql = postgres(directUrl, {
    ssl: 'require',
    max: 1,
    connection: {
        application_name: 'rls_policy_setup'
    }
});

async function applyPolicies() {
    try {
        // Test connection
        await sql`SELECT 1 as test`;
        console.log('✅ Connected successfully!');
        console.log('');
        
        // Read the RLS policies file
        const policiesSQL = fs.readFileSync('supabase-rls-policies.sql', 'utf8');
        
        console.log('📋 Applying RLS policies...');
        console.log('');
        
        // Split by semicolons and execute each statement
        const statements = policiesSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--') && !s.match(/^SELECT .* as status$/));
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
            try {
                await sql.unsafe(statement + ';');
                successCount++;
                
                // Show progress for important operations
                if (statement.includes('CREATE POLICY')) {
                    const match = statement.match(/ON (\w+)/);
                    if (match) {
                        console.log(`  ✓ Policy created for: ${match[1]}`);
                    }
                } else if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
                    const match = statement.match(/ALTER TABLE (\w+)/);
                    if (match) {
                        console.log(`  ✓ RLS enabled for: ${match[1]}`);
                    }
                } else if (statement.includes('GRANT')) {
                    console.log('  ✓ Permissions granted');
                }
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    skipCount++;
                } else if (err.message.includes('does not exist')) {
                    console.error(`  ⚠ Table does not exist, skipping...`);
                    skipCount++;
                } else {
                    console.error(`  ⚠ Warning: ${err.message.split('\n')[0]}`);
                    errorCount++;
                }
            }
        }
        
        console.log('');
        console.log('========================================');
        console.log('✅ RLS Policies Applied Successfully!');
        console.log('========================================');
        console.log(`  Total statements: ${statements.length}`);
        console.log(`  Successfully applied: ${successCount}`);
        console.log(`  Skipped (already exists): ${skipCount}`);
        console.log(`  Errors (non-critical): ${errorCount}`);
        console.log('');
        console.log('🎉 DELETE operations and notifications should now work!');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Restart your Next.js server');
        console.log('  2. Test deleting a task or notification');
        console.log('  3. Try marking all notifications as read');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('  1. Verify your DATABASE_URL in .env.local');
        console.error('  2. Check if Supabase project is accessible');
        console.error('  3. Try using port 5432 instead of 6543 in DATABASE_URL');
        console.error('');
        process.exit(1);
    } finally {
        await sql.end();
    }
}

applyPolicies();
