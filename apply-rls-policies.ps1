# Apply RLS Policies to Supabase Database
# This script fixes the delete permission and notification issues

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Supabase RLS Policy Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read the DATABASE_URL from .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $dbUrlLine = $envContent | Where-Object { $_ -match '^DATABASE_URL=' }
    if ($dbUrlLine) {
        $DATABASE_URL = $dbUrlLine -replace '^DATABASE_URL=', ''
        Write-Host "✓ Found DATABASE_URL in .env.local" -ForegroundColor Green
    } else {
        Write-Host "✗ DATABASE_URL not found in .env.local" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database Connection:" -ForegroundColor Yellow
Write-Host "  URL: $($DATABASE_URL -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "⚠ psql not found in PATH. Trying to use Node.js instead..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create a Node.js script to execute the SQL
    $nodeScript = @"
const postgres = require('postgres');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
});

async function applyPolicies() {
    console.log('🔌 Connecting to Supabase...');
    
    try {
        // Test connection
        await sql``SELECT 1``;
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
            .filter(s => s && !s.startsWith('--') && s !== '');
        
        let successCount = 0;
        let skipCount = 0;
        
        for (const statement of statements) {
            try {
                await sql.unsafe(statement + ';');
                successCount++;
                
                // Show progress for important operations
                if (statement.includes('CREATE POLICY')) {
                    const match = statement.match(/ON (\w+)/);
                    if (match) {
                        console.log(``  ✓ Policy created for: `${match[1]}``);
                    }
                } else if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
                    const match = statement.match(/ALTER TABLE (\w+)/);
                    if (match) {
                        console.log(``  ✓ RLS enabled for: `${match[1]}``);
                    }
                }
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    skipCount++;
                } else {
                    console.error(``  ⚠ Warning: `${err.message}``);
                }
            }
        }
        
        console.log('');
        console.log('========================================');
        console.log(``✅ RLS Policies Applied Successfully!``);
        console.log('========================================');
        console.log(``  Total statements: `${statements.length}``);
        console.log(``  Successfully applied: `${successCount}``);
        console.log(``  Skipped (already exists): `${skipCount}``);
        console.log('');
        console.log('🎉 DELETE operations and notifications should now work!');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Test deleting a task or notification');
        console.log('  2. Try marking all notifications as read');
        console.log('  3. If issues persist, check Supabase dashboard > Authentication > Policies');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

applyPolicies();
"@

    # Save the Node.js script
    $nodeScript | Out-File -FilePath "apply-rls-policies.js" -Encoding utf8
    
    # Run the Node.js script
    node apply-rls-policies.js
    
    # Clean up
    if (Test-Path "apply-rls-policies.js") {
        Remove-Item "apply-rls-policies.js"
    }
    
} else {
    # Use psql if available
    Write-Host "📋 Applying RLS policies using psql..." -ForegroundColor Cyan
    Write-Host ""
    
    psql $DATABASE_URL -f supabase-rls-policies.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ RLS Policies Applied Successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 DELETE operations and notifications should now work!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Test deleting a task or notification" -ForegroundColor Gray
        Write-Host "  2. Try marking all notifications as read" -ForegroundColor Gray
        Write-Host "  3. If issues persist, check Supabase dashboard > Authentication > Policies" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error applying policies" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}
