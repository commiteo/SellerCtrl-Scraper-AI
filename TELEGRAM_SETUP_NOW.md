# 📱 إعداد التليجرام الآن - دليل سريع

## 🚨 المشكلة الحالية
التليجرام مش مُعد في قاعدة البيانات، لذلك لا يتم إرسال أي تنبيهات.

## ✅ الحل السريع

### الخطوة 1: إنشاء بوت تليجرام (5 دقائق)

#### 1.1 إنشاء البوت
1. **افتح تليجرام**
2. **ابحث عن @BotFather**
3. **اكتب `/newbot`**
4. **اختر اسم:** `SellerCtrl Price Monitor`
5. **اختر username:** `sellerctrl_price_bot` (أو أي اسم متاح)
6. **احفظ Bot Token** (مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 1.2 الحصول على Chat ID
1. **ابدأ محادثة مع البوت** (اضغط Start)
2. **اكتب رسالة:** "Hello"
3. **اذهب إلى:** `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. **ابحث عن `"chat":{"id":` واحفظ الرقم** (مثل: `123456789`)

### الخطوة 2: إعداد قاعدة البيانات (2 دقيقة)

#### 2.1 فتح Supabase
1. **اذهب إلى:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **اختر مشروعك:** `aqkaxcwdcqnwzgvaqtne`
3. **انقر على "SQL Editor"**
4. **انقر على "New query"**

#### 2.2 نسخ الكود
انسخ الكود من ملف `SETUP_TELEGRAM_QUICK.sql` والصقه في SQL Editor

#### 2.3 تعديل البيانات
**استبدل هذه القيم بالقيم الحقيقية:**
```sql
-- استبدل هذه القيم
'1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'  -- ضع Bot Token الحقيقي
'123456789'                               -- ضع Chat ID الحقيقي
```

#### 2.4 تشغيل الكود
اضغط **"Run"** لتطبيق التحديثات

### الخطوة 3: اختبار التليجرام (1 دقيقة)

#### 3.1 اختبار من Terminal
```bash
node test_telegram_quick.cjs
```

#### 3.2 النتيجة المتوقعة
```
🧪 بدء اختبار التليجرام...
📱 اختبار الاتصال...
✅ التليجرام يعمل بشكل صحيح!
📱 ستتلقى تنبيهات عند:
   • تغيير الأسعار
   • خسارة Buy Box
   • كسب Buy Box
   • تحديثات مهمة
```

## 📱 أنواع التنبيهات التي ستتلقاها

### 1. **تنبيه تغيير السعر** 💰
```
💰 Price Change Alert!

📦 Product: Hepta Cream Panthenol Plus Carbamide 50g
🆔 ASIN: B0DTG9PCTT
🌍 Region: AE
👤 Seller: Tal2aa Store

💵 Old Price: AED29.30
💵 New Price: AED24.00
📊 Change: -5.30 (-18.1%)

⏰ Time: 1/31/2025, 1:51:49 PM

🔗 View Product
```

### 2. **تنبيه Buy Box** 🚨
```
🚨 Buy Box Lost Alert!

📦 Product: Hepta Cream Panthenol Plus Carbamide 50g
🆔 ASIN: B0DTG9PCTT
💰 Price: AED29.30
🌍 Region: AE

👤 Previous Seller: Tal2aa Store
🏆 New Buy Box Winner: Amazon

⏰ Time: 1/31/2025, 1:51:49 PM

🔗 View Product
```

## 🔧 استكشاف الأخطاء

### مشكلة: "Telegram notifications are disabled"
**الحل:** تأكد من إضافة البيانات في قاعدة البيانات

### مشكلة: "Failed to send Telegram message"
**الحل:** تحقق من:
1. **Bot Token** - تأكد من صحة الرمز
2. **Chat ID** - تأكد من صحة الرقم
3. **بدء المحادثة** - اضغط Start مع البوت

### مشكلة: "Error loading Telegram config"
**الحل:** تأكد من إنشاء جدول `telegram_config`

## ⚡ إعداد سريع (اختياري)

إذا كنت تريد إعداد سريع للاختبار، يمكنك استخدام هذه البيانات التجريبية:

```sql
-- إعداد تجريبي (للاستخدام المؤقت فقط)
UPDATE telegram_config 
SET bot_token = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
    chat_id = '123456789',
    is_enabled = true;
```

## 🎯 تفعيل التنبيهات

بعد إعداد التليجرام:

1. **اذهب إلى Price Monitor**
2. **اضغط "Start Monitoring"**
3. **ستبدأ التنبيهات في الوصول فوراً**

## 🎉 النتيجة النهائية

بعد الإعداد، ستتلقى:
- ✅ **تنبيهات فورية** عند تغيير الأسعار
- ✅ **تنبيهات Buy Box** عند الخسارة/الكسب
- ✅ **روابط مباشرة** للمنتجات
- ✅ **معلومات مفصلة** عن التغييرات

**التليجرام جاهز للاستخدام!** 🚀

---

## 📞 المساعدة

إذا واجهت أي مشكلة:
1. **تحقق من سجلات الباك إند**
2. **اختبر الاتصال:** `node test_telegram_quick.cjs`
3. **تحقق من إعدادات قاعدة البيانات** 