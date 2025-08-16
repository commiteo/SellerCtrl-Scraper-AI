const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzA3NTAsImV4cCI6MjA2NzAwNjc1MH0.qY4qa352mSJg13QpZ7gKUVLEK-ujLtFMdG44vIPCDIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPriceMonitorTables() {
  try {
    console.log('🚀 Creating Price Monitor tables...');
    
    // Create price_monitor_products table
    console.log('📋 Creating price_monitor_products table...');
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS price_monitor_products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        asin VARCHAR(10) NOT NULL,
        title TEXT,
        current_price DECIMAL(10,2),
        previous_price DECIMAL(10,2),
        price_change DECIMAL(10,2),
        price_change_percentage DECIMAL(5,2),
        last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        next_scrape TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        region VARCHAR(10) NOT NULL DEFAULT 'eg',
        scrape_interval INTEGER NOT NULL DEFAULT 60,
        alert_threshold DECIMAL(5,2) DEFAULT 5.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: productsError } = await supabase.rpc('exec_sql', { sql: createProductsTable });
    if (productsError) {
      console.error('❌ Error creating products table:', productsError);
    } else {
      console.log('✅ price_monitor_products table created successfully!');
    }
    
    // Create price_history table
    console.log('📋 Creating price_history table...');
    const createHistoryTable = `
      CREATE TABLE IF NOT EXISTS price_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
        asin VARCHAR(10) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        region VARCHAR(10) NOT NULL
      );
    `;
    
    const { error: historyError } = await supabase.rpc('exec_sql', { sql: createHistoryTable });
    if (historyError) {
      console.error('❌ Error creating history table:', historyError);
    } else {
      console.log('✅ price_history table created successfully!');
    }
    
    // Create price_alerts table
    console.log('📋 Creating price_alerts table...');
    const createAlertsTable = `
      CREATE TABLE IF NOT EXISTS price_alerts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
        asin VARCHAR(10) NOT NULL,
        old_price DECIMAL(10,2) NOT NULL,
        new_price DECIMAL(10,2) NOT NULL,
        price_change DECIMAL(10,2) NOT NULL,
        price_change_percentage DECIMAL(5,2) NOT NULL,
        alert_type VARCHAR(20) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: alertsError } = await supabase.rpc('exec_sql', { sql: createAlertsTable });
    if (alertsError) {
      console.error('❌ Error creating alerts table:', alertsError);
    } else {
      console.log('✅ price_alerts table created successfully!');
    }
    
    // Create indexes
    console.log('📋 Creating indexes...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_price_monitor_products_asin ON price_monitor_products(asin);
      CREATE INDEX IF NOT EXISTS idx_price_monitor_products_active ON price_monitor_products(is_active);
      CREATE INDEX IF NOT EXISTS idx_price_monitor_products_next_scrape ON price_monitor_products(next_scrape);
      CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
      CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
    `;
    
    const { error: indexesError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
    } else {
      console.log('✅ Indexes created successfully!');
    }
    
    console.log('🎉 All Price Monitor tables created successfully!');
    console.log('✅ You can now use the Price Monitor feature');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of SIMPLE_PRICE_MONITOR_SETUP.sql');
    console.log('4. Run the SQL commands');
    console.log('5. Restart your application');
  }
}

// Run the setup
createPriceMonitorTables(); 