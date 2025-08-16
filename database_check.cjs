// Comprehensive Database Check Script
// فحص شامل لقاعدة البيانات

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 بدء الفحص الشامل لقاعدة البيانات...\n');

  try {
    // 1. فحص الجداول الأساسية
    console.log('📋 فحص الجداول الأساسية...');
    
    const tables = [
      'amazon_scraping_history',
      'noon_scraping_history', 
      'multi_domain_scraping_history',
      'price_history',
      'seller_info',
      'monitored_products',
      'telegram_config',
      'users',
      'user_sessions'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ جدول ${table}: ${error.message}`);
        } else {
          console.log(`✅ جدول ${table}: موجود`);
        }
      } catch (err) {
        console.log(`❌ جدول ${table}: غير موجود - ${err.message}`);
      }
    }

    console.log('\n📊 فحص أعمدة الجداول المهمة...');

    // 2. فحص أعمدة price_history
    try {
      const { data: priceHistory, error } = await supabase
        .from('price_history')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ مشكلة في price_history: ${error.message}`);
      } else {
        console.log('✅ جدول price_history يعمل بشكل صحيح');
        if (priceHistory && priceHistory.length > 0) {
          const columns = Object.keys(priceHistory[0]);
          console.log(`   الأعمدة الموجودة: ${columns.join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ خطأ في فحص price_history: ${err.message}`);
    }

    // 3. فحص أعمدة seller_info
    try {
      const { data: sellerInfo, error } = await supabase
        .from('seller_info')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ مشكلة في seller_info: ${error.message}`);
      } else {
        console.log('✅ جدول seller_info يعمل بشكل صحيح');
        if (sellerInfo && sellerInfo.length > 0) {
          const columns = Object.keys(sellerInfo[0]);
          console.log(`   الأعمدة الموجودة: ${columns.join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ خطأ في فحص seller_info: ${err.message}`);
    }

    // 4. فحص أعمدة monitored_products
    try {
      const { data: monitoredProducts, error } = await supabase
        .from('monitored_products')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ مشكلة في monitored_products: ${error.message}`);
      } else {
        console.log('✅ جدول monitored_products يعمل بشكل صحيح');
        if (monitoredProducts && monitoredProducts.length > 0) {
          const columns = Object.keys(monitoredProducts[0]);
          console.log(`   الأعمدة الموجودة: ${columns.join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ خطأ في فحص monitored_products: ${err.message}`);
    }

    // 5. فحص telegram_config
    try {
      const { data: telegramConfig, error } = await supabase
        .from('telegram_config')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ مشكلة في telegram_config: ${error.message}`);
      } else {
        console.log('✅ جدول telegram_config يعمل بشكل صحيح');
        if (telegramConfig && telegramConfig.length > 0) {
          const columns = Object.keys(telegramConfig[0]);
          console.log(`   الأعمدة الموجودة: ${columns.join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ خطأ في فحص telegram_config: ${err.message}`);
    }

    // 6. فحص البيانات الموجودة
    console.log('\n📈 فحص البيانات الموجودة...');
    
    try {
      const { count: amazonCount } = await supabase
        .from('amazon_scraping_history')
        .select('*', { count: 'exact', head: true });
      
      const { count: noonCount } = await supabase
        .from('noon_scraping_history')
        .select('*', { count: 'exact', head: true });
      
      const { count: monitoredCount } = await supabase
        .from('monitored_products')
        .select('*', { count: 'exact', head: true });
      
      const { count: priceHistoryCount } = await supabase
        .from('price_history')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 إحصائيات البيانات:`);
      console.log(`   Amazon scraping: ${amazonCount || 0} سجل`);
      console.log(`   Noon scraping: ${noonCount || 0} سجل`);
      console.log(`   Monitored products: ${monitoredCount || 0} منتج`);
      console.log(`   Price history: ${priceHistoryCount || 0} سجل`);
    } catch (err) {
      console.log(`❌ خطأ في فحص البيانات: ${err.message}`);
    }

    // 7. فحص RLS Policies
    console.log('\n🔒 فحص RLS Policies...');
    
    try {
      const { data: policies, error } = await supabase
        .rpc('get_policies');
      
      if (error) {
        console.log(`❌ لا يمكن فحص RLS Policies: ${error.message}`);
      } else {
        console.log('✅ RLS Policies تعمل بشكل صحيح');
      }
    } catch (err) {
      console.log(`❌ خطأ في فحص RLS Policies: ${err.message}`);
    }

    // 8. فحص الاتصال
    console.log('\n🌐 فحص الاتصال بقاعدة البيانات...');
    
    try {
      const { data, error } = await supabase
        .from('amazon_scraping_history')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ مشكلة في الاتصال: ${error.message}`);
      } else {
        console.log('✅ الاتصال بقاعدة البيانات يعمل بشكل صحيح');
      }
    } catch (err) {
      console.log(`❌ خطأ في الاتصال: ${err.message}`);
    }

    console.log('\n✅ انتهى الفحص الشامل لقاعدة البيانات');

  } catch (error) {
    console.error('❌ خطأ عام في فحص قاعدة البيانات:', error);
  }
}

// تشغيل الفحص
checkDatabase().then(() => {
  console.log('\n🎉 تم الانتهاء من فحص قاعدة البيانات');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطأ في تشغيل الفحص:', error);
  process.exit(1);
}); 