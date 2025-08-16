const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTables() {
  console.log('🔍 فحص جميع الجداول المتعلقة بـ Price Monitor...\n');

  const tables = [
    'monitored_products',
    'price_monitor_products',
    'price_history',
    'seller_info',
    'amazon_scraping_history',
    'noon_scraping_history'
  ];

  for (const table of tables) {
    try {
      console.log(`📋 فحص جدول: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);

      if (error) {
        console.log(`❌ خطأ في جدول ${table}:`, error.message);
      } else {
        console.log(`✅ جدول ${table}: ${data?.length || 0} سجل`);
        
        if (data && data.length > 0) {
          console.log(`   أول سجل:`, JSON.stringify(data[0], null, 2));
        }
      }
      
      console.log('');
    } catch (err) {
      console.log(`❌ خطأ في الوصول لجدول ${table}:`, err.message);
      console.log('');
    }
  }
}

checkAllTables().then(() => {
  console.log('🎉 انتهى فحص جميع الجداول');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطأ عام:', error);
  process.exit(1);
}); 