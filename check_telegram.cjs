const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTelegram() {
  console.log('🔍 فحص إعدادات التليجرام...\n');

  try {
    // فحص جدول telegram_config
    const { data: config, error } = await supabase
      .from('telegram_config')
      .select('*')
      .single();

    if (error) {
      console.log(`❌ خطأ في جلب إعدادات التليجرام:`, error.message);
      
      if (error.code === 'PGRST116') {
        console.log('📝 لا توجد إعدادات تليجرام. يجب إعداد التليجرام أولاً.');
        console.log('\n📋 خطوات إعداد التليجرام:');
        console.log('1. إنشاء بوت تليجرام عبر @BotFather');
        console.log('2. الحصول على Bot Token');
        console.log('3. الحصول على Chat ID');
        console.log('4. إضافة البيانات في جدول telegram_config');
      }
      return;
    }

    console.log('✅ إعدادات التليجرام موجودة:');
    console.log(`   Bot Token: ${config.bot_token ? '✅ موجود' : '❌ مفقود'}`);
    console.log(`   Chat ID: ${config.chat_id ? '✅ موجود' : '❌ مفقود'}`);
    console.log(`   مفعل: ${config.is_enabled ? '✅ نعم' : '❌ لا'}`);
    console.log(`   تم الإنشاء: ${config.created_at}`);
    console.log(`   تم التحديث: ${config.updated_at}`);

    if (config.bot_token && config.chat_id && config.is_enabled) {
      console.log('\n🎉 التليجرام مُعد بشكل صحيح!');
    } else {
      console.log('\n⚠️ التليجرام غير مُعد بشكل صحيح. يرجى إكمال الإعداد.');
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

checkTelegram().then(() => {
  console.log('\n🎉 انتهى فحص التليجرام');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطأ في الفحص:', error);
  process.exit(1);
}); 