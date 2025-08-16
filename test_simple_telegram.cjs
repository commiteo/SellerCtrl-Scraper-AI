#!/usr/bin/env node

/**
 * 🧪 سكريبت اختبار خدمة Telegram الجديدة
 */

const SimpleTelegramService = require('./backend/simple_telegram_service.cjs');

async function testSimpleTelegram() {
  console.log('🧪 بدء اختبار خدمة Telegram الجديدة...\n');

  const telegramService = new SimpleTelegramService();

  // اختبار 1: فحص الإعدادات
  console.log('📋 اختبار 1: فحص الإعدادات');
  console.log('Config:', {
    enabled: telegramService.config.enabled,
    botToken: telegramService.config.botToken ? '✅ Configured' : '❌ Missing',
    chatId: telegramService.config.chatId ? '✅ Configured' : '❌ Missing'
  });

  // اختبار 2: اختبار الاتصال
  console.log('\n📋 اختبار 2: اختبار الاتصال');
  const connectionTest = await telegramService.testConnection();
  console.log('Connection test result:', connectionTest);

  // اختبار 3: إرسال رسالة بسيطة
  console.log('\n📋 اختبار 3: إرسال رسالة بسيطة');
  const simpleMessage = `
🧪 <b>Simple Telegram Test</b>

✅ <b>Test Message from Simple Service</b>
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}

🎯 <b>Service:</b> SimpleTelegramService
📱 <b>Status:</b> Working
  `.trim();

  const simpleResult = await telegramService.sendMessage(simpleMessage);
  console.log('Simple message result:', simpleResult);

  // اختبار 4: إرسال تنبيه تغير السعر
  console.log('\n📋 اختبار 4: إرسال تنبيه تغير السعر');
  const priceAlertData = {
    asin: 'B08TEST123',
    product_title: 'Test Product for Telegram',
    old_price: 'EGP 100.00',
    new_price: 'EGP 120.00',
    price_change: 20,
    price_change_percentage: 20,
    region: 'eg',
    seller_name: 'Test Seller'
  };

  const priceAlertResult = await telegramService.sendPriceChangeAlert(priceAlertData);
  console.log('Price alert result:', priceAlertResult);

  // اختبار 5: إرسال تنبيه فقدان Buy Box
  console.log('\n📋 اختبار 5: إرسال تنبيه فقدان Buy Box');
  const buyBoxLostData = {
    asin: 'B08TEST123',
    product_title: 'Test Product for Telegram',
    old_seller: 'Our Seller',
    new_seller: 'Competitor Seller',
    price: 'EGP 120.00',
    region: 'eg'
  };

  const buyBoxLostResult = await telegramService.sendBuyBoxLostAlert(buyBoxLostData);
  console.log('Buy Box Lost alert result:', buyBoxLostResult);

  // اختبار 6: إرسال تنبيه الفوز بـ Buy Box
  console.log('\n📋 اختبار 6: إرسال تنبيه الفوز بـ Buy Box');
  const buyBoxWonData = {
    asin: 'B08TEST123',
    product_title: 'Test Product for Telegram',
    old_seller: 'Competitor Seller',
    new_seller: 'Our Seller',
    price: 'EGP 120.00',
    region: 'eg'
  };

  const buyBoxWonResult = await telegramService.sendBuyBoxWonAlert(buyBoxWonData);
  console.log('Buy Box Won alert result:', buyBoxWonResult);

  // اختبار 7: حفظ سجل التنبيهات
  console.log('\n📋 اختبار 7: حفظ سجل التنبيهات');
  const alertLogData = {
    alert_type: 'price_change',
    asin: 'B08TEST123',
    product_title: 'Test Product for Telegram',
    old_price: 'EGP 100.00',
    new_price: 'EGP 120.00',
    price_change: 20,
    price_change_percentage: 20,
    region: 'eg',
    message_sent: true,
    sent_at: new Date().toISOString()
  };

  const alertLogResult = await telegramService.saveAlertLog(alertLogData);
  console.log('Alert log result:', alertLogResult);

  // اختبار 8: الحصول على إحصائيات التنبيهات
  console.log('\n📋 اختبار 8: الحصول على إحصائيات التنبيهات');
  const alertStats = await telegramService.getAlertStats();
  console.log('Alert stats result:', alertStats);

  // ملخص النتائج
  console.log('\n📊 ملخص النتائج:');
  const tests = [
    { name: 'Config Check', passed: telegramService.config !== null },
    { name: 'Connection Test', passed: connectionTest.success },
    { name: 'Simple Message', passed: simpleResult },
    { name: 'Price Alert', passed: priceAlertResult },
    { name: 'Buy Box Lost', passed: buyBoxLostResult },
    { name: 'Buy Box Won', passed: buyBoxWonResult },
    { name: 'Alert Log', passed: alertLogResult },
    { name: 'Alert Stats', passed: alertStats.success }
  ];

  const passedTests = tests.filter(test => test.passed).length;
  const totalTests = tests.length;

  tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'نجح' : 'فشل'}`);
  });

  console.log(`\n📈 نسبة النجاح: ${Math.round((passedTests / totalTests) * 100)}% (${passedTests}/${totalTests})`);

  if (passedTests === totalTests) {
    console.log('\n🎉 جميع الاختبارات نجحت! خدمة Telegram الجديدة تعمل بشكل مثالي');
  } else {
    console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة الإعدادات');
  }

  console.log('\n✨ انتهى اختبار خدمة Telegram الجديدة!');
}

// تشغيل الاختبار
testSimpleTelegram().catch(error => {
  console.error('❌ خطأ في تشغيل الاختبار:', error);
}); 