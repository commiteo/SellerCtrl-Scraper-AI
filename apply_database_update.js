const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyDatabaseUpdate() {
  console.log('🚀 Starting database update...');
  
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('supabase_migration.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        return;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('\n🎉 Database update completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the application to ensure everything works');
    console.log('2. Check the History page to see the new Data Source column');
    console.log('3. Run a test scrape to verify data_source is being saved');
    
  } catch (error) {
    console.error('❌ Error during database update:', error);
  }
}

// Alternative method using direct SQL execution
async function applyDatabaseUpdateAlternative() {
  console.log('🚀 Starting database update (alternative method)...');
  
  try {
    // Add the column
    console.log('📝 Adding data_source column...');
    const { error: addColumnError } = await supabase
      .from('amazon_scraping_history')
      .select('asin')
      .limit(1);
    
    if (addColumnError) {
      console.error('❌ Error checking table:', addColumnError);
      return;
    }
    
    console.log('✅ Column check completed');
    
    // Update existing records
    console.log('📝 Updating existing records...');
    const { error: updateError } = await supabase
      .from('amazon_scraping_history')
      .update({ data_source: 'main_page' })
      .is('data_source', null);
    
    if (updateError) {
      console.log('ℹ️ No existing records to update or column already exists');
    } else {
      console.log('✅ Existing records updated');
    }
    
    console.log('\n🎉 Database update completed!');
    console.log('\n📋 Note: You may need to manually add the column and constraints in Supabase Dashboard');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the SQL from supabase_migration.sql');
    
  } catch (error) {
    console.error('❌ Error during database update:', error);
  }
}

// Check if we can execute the migration
async function checkDatabaseAccess() {
  console.log('🔍 Checking database access...');
  
  try {
    const { data, error } = await supabase
      .from('amazon_scraping_history')
      .select('asin')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot access amazon_scraping_history table:', error);
      console.log('💡 You may need to run the SQL manually in Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Database access confirmed');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Database Update Tool for SellerCtrl');
  console.log('=====================================\n');
  
  const hasAccess = await checkDatabaseAccess();
  
  if (hasAccess) {
    await applyDatabaseUpdateAlternative();
  } else {
    console.log('\n📋 Manual Update Required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase_migration.sql');
    console.log('4. Click Run to execute the migration');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyDatabaseUpdate, applyDatabaseUpdateAlternative }; 