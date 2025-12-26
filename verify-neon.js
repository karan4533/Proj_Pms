require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    console.log('✓ Connected to Neon!');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tables found: ${tables.rows.length}`);
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check if tables have data
    if (tables.rows.length > 0) {
      console.log('\n📊 Row counts:');
      for (const row of tables.rows) {
        const count = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
        console.log(`  ${row.table_name}: ${count.rows[0].count} rows`);
      }
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
