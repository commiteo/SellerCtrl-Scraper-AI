# 📱 خطة إعداد التليجرام من الصفر - خطوة بخطوة

## 🎯 نظرة عامة على المشروع

### ✅ **ما هو موجود بالفعل:**
1. **Backend Service:** `backend/telegram_service.cjs` - خدمة التليجرام
2. **Frontend Service:** `src/services/TelegramService.ts` - خدمة الفرونت إند
3. **Settings Page:** `src/pages/TelegramSettings.tsx` - صفحة الإعدادات
4. **Integration:** مُربط مع Price Monitor في `backend/price_monitor_service.cjs`
5. **Database Tables:** موجودة لكن تحتاج تنظيف

### ❌ **المشاكل الحالية:**
1. **بيانات قديمة** في قاعدة البيانات
2. **إعدادات معطلة** (`is_enabled = FALSE`)
3. **بيانات فارغة** (`EMPTY` values)
4. **عدم تطابق** بين الفرونت إند والباك إند

## 🚀 الخطة الشاملة - خطوة بخطوة

### **المرحلة 1: تنظيف قاعدة البيانات (5 دقائق)**

#### الخطوة 1.1: حذف البيانات القديمة
```sql
-- حذف جميع البيانات القديمة
DELETE FROM telegram_config;
DELETE FROM telegram_alerts;
DELETE FROM my_seller_accounts;

-- إعادة تعيين التسلسل
ALTER SEQUENCE IF EXISTS telegram_config_id_seq RESTART WITH 1;
```

#### الخطوة 1.2: إنشاء الجداول من جديد
```sql
-- إعادة إنشاء الجداول بشكل نظيف
DROP TABLE IF EXISTS telegram_config CASCADE;
DROP TABLE IF EXISTS telegram_alerts CASCADE;
DROP TABLE IF EXISTS my_seller_accounts CASCADE;

-- إنشاء جدول إعدادات التليجرام
CREATE TABLE telegram_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_token VARCHAR(255) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول سجل تنبيهات التليجرام
CREATE TABLE telegram_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    asin VARCHAR(10) NOT NULL,
    product_title TEXT,
    old_seller VARCHAR(255),
    new_seller VARCHAR(255),
    old_price VARCHAR(50),
    new_price VARCHAR(50),
    price_change DECIMAL(10,2),
    price_change_percentage DECIMAL(5,2),
    region VARCHAR(10) NOT NULL,
    message_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول حسابات البائعين الخاصة
CREATE TABLE my_seller_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255),
    region VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء indexes للأداء
CREATE INDEX idx_telegram_config_enabled ON telegram_config(is_enabled);
CREATE INDEX idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX idx_telegram_alerts_type ON telegram_alerts(alert_type);
CREATE INDEX idx_my_seller_accounts_name ON my_seller_accounts(seller_name);
```

### **المرحلة 2: إنشاء بوت تليجرام جديد (10 دقائق)**

#### الخطوة 2.1: إنشاء البوت
1. **افتح تليجرام**
2. **ابحث عن @BotFather**
3. **اكتب `/newbot`**
4. **اختر اسم:** `SellerCtrl Price Monitor`
5. **اختر username:** `sellerctrl_price_bot` (أو أي اسم متاح)
6. **احفظ Bot Token** (مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### الخطوة 2.2: الحصول على Chat ID
1. **ابدأ محادثة مع البوت** (اضغط Start)
2. **اكتب رسالة:** "Hello"
3. **اذهب إلى:** `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. **ابحث عن `"chat":{"id":` واحفظ الرقم** (مثل: `123456789`)

### **المرحلة 3: إضافة البيانات الجديدة (2 دقيقة)**

#### الخطوة 3.1: إضافة إعدادات التليجرام
```sql
-- إضافة إعدادات التليجرام الجديدة
INSERT INTO telegram_config (bot_token, chat_id, is_enabled) 
VALUES (
  'YOUR_BOT_TOKEN_HERE',  -- ضع Bot Token الحقيقي
  'YOUR_CHAT_ID_HERE',    -- ضع Chat ID الحقيقي
  true
);
```

#### الخطوة 3.2: إضافة البائعين الخاصين
```sql
-- إضافة البائعين الخاصين
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES 
  ('Tal2aa Store', 'ae'),
  ('Aldwlyah trading', 'ae'),
  ('Amazon', 'ae');
```

### **المرحلة 4: اختبار النظام (3 دقائق)**

#### الخطوة 4.1: اختبار التليجرام
```bash
node test_telegram_quick.cjs
```

#### الخطوة 4.2: اختبار من الواجهة
1. **اذهب إلى Settings > Telegram**
2. **تحقق من الإعدادات**
3. **اضغط "Test Connection"**

#### الخطوة 4.3: اختبار التكامل
1. **اذهب إلى Price Monitor**
2. **اضغط "Start Monitoring"**
3. **أضف منتج جديد**
4. **تحقق من وصول التنبيهات**

### **المرحلة 5: تحسين النظام (اختياري)**

#### الخطوة 5.1: إضافة ميزات متقدمة
```sql
-- إضافة إعدادات متقدمة
ALTER TABLE telegram_config 
ADD COLUMN alert_types TEXT[] DEFAULT ARRAY['price_change', 'buybox_change'],
ADD COLUMN quiet_hours_start TIME DEFAULT '22:00',
ADD COLUMN quiet_hours_end TIME DEFAULT '08:00',
ADD COLUMN max_alerts_per_hour INTEGER DEFAULT 50;
```

#### الخطوة 5.2: إضافة قوالب رسائل مخصصة
```sql
-- إضافة قوالب رسائل
CREATE TABLE telegram_message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO telegram_message_templates (template_name, template_content) VALUES
('price_change', '💰 Price Change Alert!\n\n📦 Product: {product_title}\n🆔 ASIN: {asin}\n🌍 Region: {region}\n👤 Seller: {seller_name}\n\n💵 Old Price: {old_price}\n💵 New Price: {new_price}\n📊 Change: {price_change} ({price_change_percentage}%)\n\n⏰ Time: {timestamp}\n\n🔗 View Product'),
('buybox_lost', '🚨 Buy Box Lost Alert!\n\n📦 Product: {product_title}\n🆔 ASIN: {asin}\n💰 Price: {price}\n🌍 Region: {region}\n\n👤 Previous Seller: {old_seller}\n🏆 New Buy Box Winner: {new_seller}\n\n⏰ Time: {timestamp}\n\n🔗 View Product');
```

## 📱 أنواع التنبيهات المتوقعة

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

### مشكلة: "Telegram config loaded: not configured"
**الحل:** تأكد من إضافة البيانات في قاعدة البيانات

### مشكلة: "Failed to send Telegram message"
**الحل:** تحقق من:
1. **Bot Token** - تأكد من صحة الرمز
2. **Chat ID** - تأكد من صحة الرقم
3. **بدء المحادثة** - اضغط Start مع البوت

### مشكلة: لا تصل التنبيهات
**الحل:**
1. **تحقق من `is_enabled = true`**
2. **تأكد من تشغيل Price Monitor**
3. **اختبر الاتصال:** `node test_telegram_quick.cjs`

## 🎯 الجدول الزمني

| المرحلة | الوقت | الوصف |
|---------|-------|--------|
| 1 | 5 دقائق | تنظيف قاعدة البيانات |
| 2 | 10 دقائق | إنشاء بوت تليجرام |
| 3 | 2 دقيقة | إضافة البيانات |
| 4 | 3 دقائق | اختبار النظام |
| 5 | 5 دقائق | تحسينات (اختياري) |
| **المجموع** | **25 دقيقة** | **إعداد كامل** |

## 🎉 النتيجة النهائية

بعد الإعداد الكامل، ستتلقى:
- ✅ **تنبيهات فورية** عند تغيير الأسعار
- ✅ **تنبيهات Buy Box** عند الخسارة/الكسب
- ✅ **روابط مباشرة** للمنتجات
- ✅ **معلومات مفصلة** عن التغييرات
- ✅ **سجل كامل** للتنبيهات
- ✅ **واجهة إدارة** سهلة الاستخدام

**التليجرام جاهز للاستخدام!** 🚀

---

## 📞 المساعدة

إذا واجهت أي مشكلة في أي خطوة:
1. **تحقق من سجلات الباك إند**
2. **اختبر الاتصال:** `node test_telegram_quick.cjs`
3. **تحقق من إعدادات قاعدة البيانات**
4. **راجع هذا الدليل مرة أخرى** 