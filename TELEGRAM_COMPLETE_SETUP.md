# 📱 إعداد التليجرام الشامل

## 🎯 نظرة عامة
نظام التليجرام مُعد بالفعل في التطبيق ويُرسل تنبيهات تلقائياً عند:
- تغيير الأسعار
- خسارة/كسب Buy Box
- تحديثات مهمة

## 🚀 خطوات الإعداد السريع

### الخطوة 1: إنشاء بوت تليجرام
1. **افتح تليجرام وابحث عن @BotFather**
2. **اكتب `/newbot`**
3. **اختر اسم:** `SellerCtrl Price Monitor`
4. **اختر username:** `sellerctrl_price_bot`
5. **احفظ Bot Token** (مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### الخطوة 2: الحصول على Chat ID
1. **ابدأ محادثة مع البوت** (اضغط Start)
2. **اكتب:** "Hello"
3. **اذهب إلى:** `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. **ابحث عن `"chat":{"id":` واحفظ الرقم**

### الخطوة 3: إعداد قاعدة البيانات

#### 3.1 إنشاء جداول التليجرام
```sql
-- جدول إعدادات التليجرام
CREATE TABLE IF NOT EXISTS telegram_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_token VARCHAR(255) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل تنبيهات التليجرام
CREATE TABLE IF NOT EXISTS telegram_alerts (
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

-- جدول حسابات البائعين الخاصة
CREATE TABLE IF NOT EXISTS my_seller_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255),
    region VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_telegram_config_enabled ON telegram_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_type ON telegram_alerts(alert_type);
```

#### 3.2 إضافة إعدادات التليجرام
```sql
-- إضافة إعدادات التليجرام
INSERT INTO telegram_config (bot_token, chat_id, is_enabled) 
VALUES (
  'YOUR_BOT_TOKEN_HERE',  -- ضع Bot Token هنا
  'YOUR_CHAT_ID_HERE',    -- ضع Chat ID هنا
  true
);

-- إضافة بائع خاص (اختياري)
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES ('Tal2aa Store', 'ae');
```

### الخطوة 4: اختبار التليجرام

#### 4.1 اختبار من Terminal
```bash
node test_telegram_quick.js
```

#### 4.2 اختبار من الواجهة
1. **اذهب إلى Settings > Telegram**
2. **أضف Bot Token و Chat ID**
3. **اضغط "Test Connection"**

## 📱 أنواع التنبيهات

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

### 2. **تنبيه خسارة Buy Box** 🚨
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

### 3. **تنبيه كسب Buy Box** 🎉
```
🎉 Buy Box Won!

📦 Product: Hepta Cream Panthenol Plus Carbamide 50g
🆔 ASIN: B0DTG9PCTT
💰 Price: AED29.30
🌍 Region: AE

👤 Previous Seller: Amazon
🏆 New Buy Box Winner: Tal2aa Store

⏰ Time: 1/31/2025, 1:51:49 PM

🔗 View Product
```

## ⚙️ الإعدادات المتقدمة

### تفعيل/تعطيل التنبيهات
```sql
-- تفعيل التليجرام
UPDATE telegram_config SET is_enabled = true;

-- تعطيل التليجرام
UPDATE telegram_config SET is_enabled = false;
```

### إضافة بائعين خاصين
```sql
-- إضافة بائع خاص
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES ('Tal2aa Store', 'ae');

-- إضافة بائع آخر
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES ('Amazon', 'ae');
```

### حذف بائع خاص
```sql
-- حذف بائع
DELETE FROM my_seller_accounts WHERE seller_name = 'Tal2aa Store';
```

## 🔧 استكشاف الأخطاء

### مشكلة: لا تصل الإشعارات
1. **تحقق من Bot Token** - تأكد من صحة الرمز
2. **تحقق من Chat ID** - تأكد من صحة الرقم
3. **تأكد من بدء المحادثة** - اضغط Start مع البوت
4. **تحقق من سجلات الباك إند** - ابحث عن أخطاء

### مشكلة: رسائل خطأ
```bash
# تحقق من سجلات الباك إند
npm run backend

# اختبار الاتصال
node test_telegram_quick.js
```

### مشكلة: جداول غير موجودة
```sql
-- تحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('telegram_config', 'telegram_alerts', 'my_seller_accounts');
```

## 📊 مراقبة التنبيهات

### عرض سجل التنبيهات
```sql
-- عرض جميع التنبيهات
SELECT * FROM telegram_alerts ORDER BY created_at DESC;

-- عرض تنبيهات اليوم
SELECT * FROM telegram_alerts 
WHERE DATE(created_at) = CURRENT_DATE 
ORDER BY created_at DESC;

-- إحصائيات التنبيهات
SELECT 
  alert_type,
  COUNT(*) as count,
  DATE(created_at) as date
FROM telegram_alerts 
GROUP BY alert_type, DATE(created_at)
ORDER BY date DESC, count DESC;
```

### عرض إعدادات التليجرام
```sql
-- عرض الإعدادات الحالية
SELECT * FROM telegram_config;

-- عرض البائعين الخاصين
SELECT * FROM my_seller_accounts WHERE is_active = true;
```

## 🎯 التكامل مع Price Monitor

### كيف يعمل التكامل:
1. **Price Monitor** يراقب المنتجات كل فترة
2. **عند تغيير السعر** → يُرسل تنبيه تليجرام
3. **عند تغيير Buy Box** → يُرسل تنبيه تليجرام
4. **يُحفظ سجل** في جدول `telegram_alerts`

### تفعيل المراقبة:
1. **اذهب إلى Price Monitor**
2. **اضغط "Start Monitoring"**
3. **ستبدأ التنبيهات في الوصول**

## 🎉 النتيجة النهائية

بعد الإعداد، ستتلقى:
- ✅ **تنبيهات فورية** عند تغيير الأسعار
- ✅ **تنبيهات Buy Box** عند الخسارة/الكسب
- ✅ **روابط مباشرة** للمنتجات
- ✅ **معلومات مفصلة** عن التغييرات
- ✅ **سجل كامل** للتنبيهات

**التليجرام جاهز للاستخدام!** 🚀

### الخطوات النهائية:
1. ✅ إنشاء البوت
2. ✅ إعداد قاعدة البيانات
3. ✅ اختبار الاتصال
4. ✅ تفعيل Price Monitor
5. �� استقبال التنبيهات! 