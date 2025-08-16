#!/usr/bin/env node

/**
 * 🚀 سكريبت إعداد Telegram السريع
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configPath = path.join(__dirname, 'backend', 'telegram_config.json');

console.log('🚀 بدء إعداد Telegram السريع...\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupTelegram() {
  try {
    console.log('📋 خطوات الإعداد:\n');
    console.log('1️⃣ إنشاء Bot في Telegram:');
    console.log('   - افتح Telegram وابحث عن @BotFather');
    console.log('   - أرسل /newbot');
    console.log('   - اتبع التعليمات واحفظ Bot Token\n');
    
    console.log('2️⃣ الحصول على Chat ID:');
    console.log('   - أرسل رسالة إلى bot الخاص بك');
    console.log('   - ابحث عن @userinfobot في Telegram');
    console.log('   - أرسل له رسالة وسيعطيك Chat ID\n');

    const botToken = await question('🤖 أدخل Bot Token: ');
    const chatId = await question('💬 أدخل Chat ID: ');
    
    if (!botToken || !chatId) {
      console.log('❌ يجب إدخال Bot Token و Chat ID');
      rl.close();
      return;
    }

    // إنشاء ملف الإعدادات
    const config = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled: true
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('\n✅ تم حفظ الإعدادات بنجاح!');

    // اختبار الاتصال
    console.log('\n🧪 اختبار الاتصال...');
    const SimpleTelegramService = require('./backend/simple_telegram_service.cjs');
    const telegramService = new SimpleTelegramService();
    
    const testResult = await telegramService.testConnection();
    
    if (testResult.success) {
      console.log('✅ الاتصال ناجح!');
      console.log('📱 تم إرسال رسالة اختبار إلى Telegram');
    } else {
      console.log('❌ فشل في الاتصال:', testResult.error);
      console.log('🔧 يرجى مراجعة الإعدادات');
    }

    console.log('\n🎉 تم إعداد Telegram بنجاح!');
    console.log('📋 يمكنك الآن استخدام Price Monitor مع Telegram');

  } catch (error) {
    console.error('❌ خطأ في الإعداد:', error);
  } finally {
    rl.close();
  }
}

setupTelegram(); 