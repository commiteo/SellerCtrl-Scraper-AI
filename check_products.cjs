const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 فحص منتجات Price Monitor...\n');

  try {
    // فحص جميع المنتجات
    const { data: allProducts, error: allError } = await supabase
      .from('price_monitor_products')
      .select('*');

    if (allError) {
      console.error('❌ خطأ في جلب المنتجات:', allError);
      return;
    }

    console.log(`📊 إجمالي المنتجات: ${allProducts?.length || 0}`);

    if (allProducts && allProducts.length > 0) {
      console.log('\n📋 تفاصيل المنتجات:');
      allProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.asin} (${product.region})`);
        console.log(`   العنوان: ${product.title}`);
        console.log(`   السعر الحالي: ${product.current_price}`);
        console.log(`   البائع: ${product.seller_name}`);
        console.log(`   الحالة: ${product.is_active ? 'نشط' : 'غير نشط'}`);
        console.log(`   is_active: ${product.is_active ? 'نعم' : 'لا'}`);
        console.log(`   next_scrape: ${product.next_scrape}`);
        console.log(`   Due now: ${new Date(product.next_scrape) <= new Date() ? 'نعم' : 'لا'}`);
      });
    }

    // فحص المنتجات النشطة
    const { data: activeProducts, error: activeError } = await supabase
      .from('price_monitor_products')
      .select('*')
      .eq('is_active', true);

    console.log(`\n✅ المنتجات النشطة (is_active=true): ${activeProducts?.length || 0}`);

    // فحص المنتجات المستحقة للسكرابينج
    const { data: dueProducts, error: dueError } = await supabase
      .from('price_monitor_products')
      .select('*')
      .eq('is_active', true)
      .lte('next_scrape', new Date().toISOString());

    console.log(`✅ المنتجات المستحقة (is_active=true): ${dueProducts?.length || 0}`);

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

checkProducts().then(() => {
  console.log('\n🎉 انتهى الفحص');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطأ في الفحص:', error);
  process.exit(1);
}); 