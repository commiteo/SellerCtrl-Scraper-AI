// Fix Database Script
// إصلاح قاعدة البيانات وإنشاء الجداول المفقودة

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('🔧 بدء إصلاح قاعدة البيانات...\n');

  try {
    // 1. إنشاء جدول monitored_products
    console.log('📋 إنشاء جدول monitored_products...');
    
    const createMonitoredProducts = `
      CREATE TABLE IF NOT EXISTS monitored_products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        asin VARCHAR(20) NOT NULL,
        title TEXT,
        current_price DECIMAL(10,2),
        previous_price DECIMAL(10,2),
        price_change DECIMAL(10,2),
        price_change_percent DECIMAL(5,2),
        current_seller VARCHAR(255),
        has_buybox BOOLEAN DEFAULT false,
        total_offers INTEGER DEFAULT 0,
        region VARCHAR(10) DEFAULT 'US',
        status BOOLEAN DEFAULT true,
        scrape_interval INTEGER DEFAULT 60,
        alert_threshold DECIMAL(5,2) DEFAULT 5.0,
        next_scrape TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_scraped TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID,
        price_display VARCHAR(50),
        image_url TEXT,
        product_link TEXT
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createMonitoredProducts });
      if (error) {
        console.log(`❌ خطأ في إنشاء monitored_products: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء جدول monitored_products بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء monitored_products: ${err.message}`);
    }

    // 2. إنشاء جدول multi_domain_scraping_history
    console.log('\n📋 إنشاء جدول multi_domain_scraping_history...');
    
    const createMultiDomainHistory = `
      CREATE TABLE IF NOT EXISTS multi_domain_scraping_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        asin VARCHAR(20) NOT NULL,
        title TEXT,
        price DECIMAL(10,2),
        seller VARCHAR(255),
        has_buybox BOOLEAN DEFAULT false,
        total_offers INTEGER DEFAULT 0,
        region VARCHAR(10),
        domain VARCHAR(50),
        status VARCHAR(20) DEFAULT 'success',
        error_message TEXT,
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID,
        price_display VARCHAR(50),
        image_url TEXT,
        product_link TEXT
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createMultiDomainHistory });
      if (error) {
        console.log(`❌ خطأ في إنشاء multi_domain_scraping_history: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء جدول multi_domain_scraping_history بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء multi_domain_scraping_history: ${err.message}`);
    }

    // 3. إنشاء جدول users
    console.log('\n📋 إنشاء جدول users...');
    
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP WITH TIME ZONE
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createUsers });
      if (error) {
        console.log(`❌ خطأ في إنشاء users: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء جدول users بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء users: ${err.message}`);
    }

    // 4. إنشاء جدول user_sessions
    console.log('\n📋 إنشاء جدول user_sessions...');
    
    const createUserSessions = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createUserSessions });
      if (error) {
        console.log(`❌ خطأ في إنشاء user_sessions: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء جدول user_sessions بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء user_sessions: ${err.message}`);
    }

    // 5. إضافة أعمدة مفقودة لـ price_history
    console.log('\n🔧 إضافة أعمدة مفقودة لـ price_history...');
    
    const addPriceHistoryColumns = `
      ALTER TABLE price_history 
      ADD COLUMN IF NOT EXISTS price_display VARCHAR(50),
      ADD COLUMN IF NOT EXISTS user_id UUID;
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: addPriceHistoryColumns });
      if (error) {
        console.log(`❌ خطأ في إضافة أعمدة price_history: ${error.message}`);
      } else {
        console.log('✅ تم إضافة الأعمدة المفقودة لـ price_history');
      }
    } catch (err) {
      console.log(`❌ خطأ في إضافة أعمدة price_history: ${err.message}`);
    }

    // 6. إضافة أعمدة مفقودة لـ seller_info
    console.log('\n🔧 إضافة أعمدة مفقودة لـ seller_info...');
    
    const addSellerInfoColumns = `
      ALTER TABLE seller_info 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS buybox_price_display VARCHAR(50),
      ADD COLUMN IF NOT EXISTS user_id UUID;
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: addSellerInfoColumns });
      if (error) {
        console.log(`❌ خطأ في إضافة أعمدة seller_info: ${error.message}`);
      } else {
        console.log('✅ تم إضافة الأعمدة المفقودة لـ seller_info');
      }
    } catch (err) {
      console.log(`❌ خطأ في إضافة أعمدة seller_info: ${err.message}`);
    }

    // 7. إنشاء Indexes
    console.log('\n📊 إنشاء Indexes...');
    
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_monitored_products_asin ON monitored_products(asin);
      CREATE INDEX IF NOT EXISTS idx_monitored_products_status ON monitored_products(status);
      CREATE INDEX IF NOT EXISTS idx_monitored_products_next_scrape ON monitored_products(next_scrape);
      CREATE INDEX IF NOT EXISTS idx_multi_domain_asin ON multi_domain_scraping_history(asin);
      CREATE INDEX IF NOT EXISTS idx_multi_domain_region ON multi_domain_scraping_history(region);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createIndexes });
      if (error) {
        console.log(`❌ خطأ في إنشاء Indexes: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء Indexes بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء Indexes: ${err.message}`);
    }

    // 8. إنشاء RLS Policies
    console.log('\n🔒 إنشاء RLS Policies...');
    
    const createRLSPolicies = `
      -- Enable RLS on all tables
      ALTER TABLE monitored_products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE multi_domain_scraping_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
      
      -- Create policies for monitored_products
      CREATE POLICY "Users can view their own monitored products" ON monitored_products
        FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
      
      CREATE POLICY "Users can insert their own monitored products" ON monitored_products
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own monitored products" ON monitored_products
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own monitored products" ON monitored_products
        FOR DELETE USING (auth.uid() = user_id);
      
      -- Create policies for multi_domain_scraping_history
      CREATE POLICY "Users can view their own scraping history" ON multi_domain_scraping_history
        FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
      
      CREATE POLICY "Users can insert their own scraping history" ON multi_domain_scraping_history
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      -- Create policies for users
      CREATE POLICY "Users can view their own profile" ON users
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update their own profile" ON users
        FOR UPDATE USING (auth.uid() = id);
      
      -- Create policies for user_sessions
      CREATE POLICY "Users can view their own sessions" ON user_sessions
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can manage their own sessions" ON user_sessions
        FOR ALL USING (auth.uid() = user_id);
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createRLSPolicies });
      if (error) {
        console.log(`❌ خطأ في إنشاء RLS Policies: ${error.message}`);
      } else {
        console.log('✅ تم إنشاء RLS Policies بنجاح');
      }
    } catch (err) {
      console.log(`❌ خطأ في إنشاء RLS Policies: ${err.message}`);
    }

    console.log('\n✅ تم الانتهاء من إصلاح قاعدة البيانات');

  } catch (error) {
    console.error('❌ خطأ عام في إصلاح قاعدة البيانات:', error);
  }
}

// تشغيل الإصلاح
fixDatabase().then(() => {
  console.log('\n🎉 تم الانتهاء من إصلاح قاعدة البيانات');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطأ في تشغيل الإصلاح:', error);
  process.exit(1);
}); 