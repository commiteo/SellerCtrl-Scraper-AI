# 📱 دليل إعداد Telegram الجديد والبسيط

## 🎯 نظرة عامة

تم إنشاء خدمة Telegram جديدة وبسيطة لحل مشاكل الخدمة القديمة. الخدمة الجديدة:

- ✅ **بسيطة وسهلة الاستخدام**
- ✅ **موثوقة ومستقرة**
- ✅ **تدعم جميع أنواع التنبيهات**
- ✅ **تحفظ سجل التنبيهات**

## 🚀 خطوات الإعداد

### 1. إنشاء Bot في Telegram

1. افتح Telegram وابحث عن `@BotFather`
2. أرسل `/newbot`
3. اتبع التعليمات لإنشاء bot جديد
4. احفظ **Bot Token** الذي ستحصل عليه

### 2. الحصول على Chat ID

#### الطريقة الأولى (الأسهل):
1. أرسل رسالة إلى bot الخاص بك
2. افتح هذا الرابط في المتصفح:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. ابحث عن `"chat":{"id":` واحفظ الرقم

#### الطريقة الثانية:
1. أرسل رسالة إلى bot الخاص بك
2. ابحث عن `@userinfobot` في Telegram
3. أرسل له رسالة وسيعطيك Chat ID

### 3. تحديث الإعدادات

#### الطريقة الأولى: عبر ملف الإعدادات
1. افتح ملف `backend/telegram_config.json`
2. أضف البيانات:
```json
{
  "botToken": "YOUR_BOT_TOKEN_HERE",
  "chatId": "YOUR_CHAT_ID_HERE",
  "enabled": true
}
```

#### الطريقة الثانية: عبر متغيرات البيئة
أضف هذه المتغيرات إلى ملف `.env`:
```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

### 4. اختبار الإعدادات

شغل سكريبت الاختبار:
```bash
node test_simple_telegram.cjs
```

## 📋 أنواع التنبيهات المدعومة

### 1. تنبيهات تغير السعر
```
💰 Price Change Alert!

📦 Product: Product Name
🆔 ASIN: B08XXXXXXX
🌍 Region: EG
👤 Seller: Seller Name

💵 Old Price: EGP 100.00
💵 New Price: EGP 120.00
📊 Change: +20.00 (+20.0%)

⏰ Time: 01/21/2025, 10:30 AM

🔗 View Product
```

### 2. تنبيهات فقدان Buy Box
```
🚨 Buy Box Lost!

📦 Product: Product Name
🆔 ASIN: B08XXXXXXX
🌍 Region: EG

👤 Previous Seller: Our Seller
👤 New Seller: Competitor Seller
💰 Price: EGP 120.00

⏰ Time: 01/21/2025, 10:30 AM

🔗 View Product
```

### 3. تنبيهات الفوز بـ Buy Box
```
🎉 Buy Box Won!

📦 Product: Product Name
🆔 ASIN: B08XXXXXXX
🌍 Region: EG

👤 Previous Seller: Competitor Seller
👤 Our Seller: Our Seller
💰 Price: EGP 120.00

⏰ Time: 01/21/2025, 10:30 AM

🔗 View Product
```

## 🔧 الميزات الجديدة

### ✅ **إدارة الإعدادات**
- حفظ الإعدادات في ملف JSON
- دعم متغيرات البيئة
- تحميل تلقائي للإعدادات

### ✅ **إرسال الرسائل**
- رسائل بسيطة
- تنبيهات تغير السعر
- تنبيهات Buy Box
- دعم HTML formatting

### ✅ **سجل التنبيهات**
- حفظ جميع التنبيهات في قاعدة البيانات
- إحصائيات التنبيهات
- تتبع حالة الإرسال

### ✅ **معالجة الأخطاء**
- معالجة شاملة للأخطاء
- رسائل خطأ واضحة
- fallback mechanisms

## 🧪 اختبار الخدمة

### اختبار سريع:
```bash
node test_simple_telegram.cjs
```

### اختبار يدوي:
1. تأكد من صحة الإعدادات
2. شغل الخادم: `npm run backend`
3. ابدأ مراقبة الأسعار
4. راقب الرسائل في Telegram

## 🔍 استكشاف الأخطاء

### المشكلة: لا تصل الرسائل
**الحلول:**
1. تأكد من صحة Bot Token
2. تأكد من صحة Chat ID
3. تأكد من أن Bot مفعل
4. أرسل رسالة إلى Bot أولاً

### المشكلة: خطأ في الاتصال
**الحلول:**
1. تأكد من الاتصال بالإنترنت
2. تحقق من إعدادات Firewall
3. تأكد من صحة URL

### المشكلة: رسائل فارغة
**الحلول:**
1. تأكد من صحة البيانات
2. تحقق من تنسيق الرسالة
3. راقب console logs

## 📊 مراقبة الأداء

### سجل التنبيهات:
```javascript
const stats = await telegramService.getAlertStats();
console.log('Alert stats:', stats);
```

### حالة الخدمة:
```javascript
const test = await telegramService.testConnection();
console.log('Service status:', test);
```

## 🎯 الخلاصة

الخدمة الجديدة بسيطة وموثوقة وتدعم جميع الميزات المطلوبة:

- ✅ **سهلة الإعداد**
- ✅ **موثوقة**
- ✅ **تدعم جميع التنبيهات**
- ✅ **تحفظ السجلات**
- ✅ **معالجة شاملة للأخطاء**

**🚀 جاهزة للاستخدام في الإنتاج!** 