const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMultiDomainDatabase() {
  try {
    console.log('🚀 Setting up Multi-Domain Database...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'multi_domain_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Database setup failed:', error);
      return;
    }
    
    console.log('✅ Multi-Domain Database setup completed successfully!');
    console.log('🎉 You can now use the Multi-Domain Scraper');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    // Alternative: Manual instructions
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of multi_domain_migration.sql');
    console.log('4. Run the SQL commands');
    console.log('5. Restart your application');
  }
}

// Run the setup
setupMultiDomainDatabase(); 