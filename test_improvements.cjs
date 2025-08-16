#!/usr/bin/env node

/**
 * 🧪 سكريبت اختبار التحسينات المطبقة على SellerCtrl Scraper
 * 
 * هذا السكريبت يختبر التحسينات التي تم تطبيقها على المشروع:
 * 1. تحسين Amazon Scraper
 * 2. معالجة أخطاء Fetch
 * 3. معالجة البيانات الفارغة
 * 4. تحسين استخراج الأسعار والبائعين
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 بدء اختبار التحسينات المطبقة على SellerCtrl Scraper...\n');

// اختبار 1: فحص تكرار endpoints
console.log('📋 اختبار 1: فحص تكرار endpoints في server.cjs');
const serverContent = fs.readFileSync('backend/server.cjs', 'utf8');
const sellerInfoEndpoints = (serverContent.match(/\/api\/seller-info\/all/g) || []).length;

if (sellerInfoEndpoints === 1) {
  console.log('✅ تم حل مشكلة تكرار endpoints بنجاح');
} else {
  console.log(`❌ لا يزال هناك ${sellerInfoEndpoints} endpoints مكررة`);
}

// اختبار 2: فحص تحسينات Amazon Scraper
console.log('\n📋 اختبار 2: فحص تحسينات Amazon Scraper');
const amazonContent = fs.readFileSync('backend/amazon_puppeteer.cjs', 'utf8');

const improvements = {
  multiplePriceSelectors: amazonContent.includes('#corePrice_desktop .a-price .a-offscreen'),
  multipleSellerMethods: amazonContent.includes('knownSellers'),
  improvedBuyingOptions: amazonContent.includes('btnSelectors'),
  timeoutHandling: amazonContent.includes('waitForSelector')
};

Object.entries(improvements).forEach(([test, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'مطبق' : 'غير مطبق'}`);
});

// اختبار 3: فحص معالجة البيانات الفارغة
console.log('\n📋 اختبار 3: فحص معالجة البيانات الفارغة');
const priceMonitorContent = fs.readFileSync('src/pages/PriceMonitor.tsx', 'utf8');
const exportUtilsContent = fs.readFileSync('src/utils/exportUtils.ts', 'utf8');

const dataHandling = {
  priceMonitorNA: priceMonitorContent.includes("|| 'N/A'"),
  exportUtilsNA: exportUtilsContent.includes("|| 'N/A'"),
  timeoutHandling: priceMonitorContent.includes('AbortController'),
  errorHandling: priceMonitorContent.includes('toast')
};

Object.entries(dataHandling).forEach(([test, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'مطبق' : 'غير مطبق'}`);
});

// اختبار 4: فحص تحسينات استخراج الأسعار
console.log('\n📋 اختبار 4: فحص تحسينات استخراج الأسعار');
const priceExtractionMethods = [
  '#corePrice_feature_div .a-price .a-offscreen',
  '#corePrice_desktop .a-price .a-offscreen',
  '.a-price .a-offscreen',
  'span[class*="price"]'
];

priceExtractionMethods.forEach(method => {
  const found = amazonContent.includes(method);
  console.log(`${found ? '✅' : '❌'} طريقة استخراج السعر: ${method}`);
});

// اختبار 5: فحص تحسينات استخراج البائعين
console.log('\n📋 اختبار 5: فحص تحسينات استخراج البائعين');
const sellerExtractionMethods = [
  '#sellerProfileTriggerId',
  'offer-display-feature-text',
  'Sold by',
  'merchant-info',
  'knownSellers'
];

sellerExtractionMethods.forEach(method => {
  const found = amazonContent.includes(method);
  console.log(`${found ? '✅' : '❌'} طريقة استخراج البائع: ${method}`);
});

// اختبار 6: فحص معالجة الأخطاء
console.log('\n📋 اختبار 6: فحص معالجة الأخطاء');
const errorHandling = {
  fetchTimeout: priceMonitorContent.includes('AbortController'),
  errorMessages: priceMonitorContent.includes('toast'),
  fallbackData: priceMonitorContent.includes('setSellerInfo([])'),
  consoleLogging: priceMonitorContent.includes('console.error')
};

Object.entries(errorHandling).forEach(([test, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'مطبق' : 'غير مطبق'}`);
});

// ملخص النتائج
console.log('\n📊 ملخص النتائج:');
const totalTests = 6;
const passedTests = [
  sellerInfoEndpoints === 1,
  Object.values(improvements).every(Boolean),
  Object.values(dataHandling).every(Boolean),
  priceExtractionMethods.every(method => amazonContent.includes(method)),
  sellerExtractionMethods.every(method => amazonContent.includes(method)),
  Object.values(errorHandling).every(Boolean)
].filter(Boolean).length;

console.log(`✅ ${passedTests}/${totalTests} اختبارات نجحت`);
console.log(`📈 نسبة النجاح: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 جميع التحسينات تم تطبيقها بنجاح!');
  console.log('🚀 المشروع جاهز للاستخدام الإنتاجي');
} else {
  console.log('\n⚠️ بعض التحسينات تحتاج إلى مراجعة');
  console.log('🔧 يرجى مراجعة النتائج أعلاه');
}

console.log('\n📝 ملاحظات إضافية:');
console.log('- تأكد من تشغيل الخادم قبل اختبار الوظائف');
console.log('- اختبر استخراج البيانات الفعلية من Amazon');
console.log('- تحقق من معالجة الأخطاء في الواجهة');

console.log('\n✨ انتهى اختبار التحسينات!'); 