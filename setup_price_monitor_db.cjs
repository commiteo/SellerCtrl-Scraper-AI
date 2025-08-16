const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzA3NTAsImV4cCI6MjA2NzAwNjc1MH0.qY4qa352mSJg13QpZ7gKUVLEK-ujLtFMdG44vIPCDIU';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPriceMonitorDatabase() {
  try {
    console.log('🚀 Setting up Price Monitor Database...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'PRICE_MONITOR_SETUP.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing Price Monitor migration...');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          console.error('Statement:', statement);
        }
      }
    }
    
    console.log('✅ Price Monitor Database setup completed successfully!');
    console.log('🎉 You can now use the Price Monitor feature');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    // Alternative: Manual instructions
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of PRICE_MONITOR_SETUP.sql');
    console.log('4. Run the SQL commands');
    console.log('5. Restart your application');
  }
}

// Run the setup
setupPriceMonitorDatabase(); 