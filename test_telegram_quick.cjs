// اختبار سريع للتليجرام
const TelegramService = require('./backend/telegram_service.cjs');

async function testTelegram() {
  console.log('🧪 بدء اختبار التليجرام...');
  
  const telegramService = new TelegramService();
  
  try {
    // تحميل الإعدادات
    await telegramService.loadConfig();
    
    // اختبار الاتصال
    console.log('📱 اختبار الاتصال...');
    const result = await telegramService.testConnection();
    
    if (result) {
      console.log('✅ التليجرام يعمل بشكل صحيح!');
      console.log('📱 ستتلقى تنبيهات عند:');
      console.log('   • تغيير الأسعار');
      console.log('   • خسارة Buy Box');
      console.log('   • كسب Buy Box');
      console.log('   • تحديثات مهمة');
    } else {
      console.log('❌ فشل في إرسال رسالة التليجرام');
      console.log('🔧 تحقق من:');
      console.log('   • Bot Token');
      console.log('   • Chat ID');
      console.log('   • بدء المحادثة مع البوت');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار التليجرام:', error);
  }
}

// تشغيل الاختبار
testTelegram(); 