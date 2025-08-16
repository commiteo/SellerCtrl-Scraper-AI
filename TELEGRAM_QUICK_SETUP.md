# 📱 إعداد التليجرام السريع

## 🎯 الهدف
إعداد إشعارات تليجرام لتلقي تنبيهات عند:
- تغيير الأسعار
- خسارة Buy Box
- كسب Buy Box
- تحديثات مهمة

## 🚀 خطوات الإعداد السريع

### الخطوة 1: إنشاء بوت تليجرام
1. **افتح تليجرام وابحث عن @BotFather**
2. **اكتب `/newbot`**
3. **اختر اسم للبوت:** `SellerCtrl Price Monitor`
4. **اختر username:** `sellerctrl_price_bot` (أو أي اسم متاح)
5. **احفظ Bot Token** (مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### الخطوة 2: الحصول على Chat ID
1. **ابدأ محادثة مع البوت** (اضغط Start)
2. **اكتب رسالة للبوت:** "Hello"
3. **اذهب إلى:** `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. **ابحث عن `"chat":{"id":` في النتيجة**
5. **احفظ Chat ID** (مثل: `123456789`)

### الخطوة 3: إعداد قاعدة البيانات

#### 3.1 إنشاء جداول التليجرام
اذهب إلى **Supabase SQL Editor** وانسخ هذا الكود:

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

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_telegram_config_enabled ON telegram_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_type ON telegram_alerts(alert_type);
```

#### 3.2 إضافة إعدادات التليجرام
```sql
-- إضافة إعدادات التليجرام (استبدل بالقيم الحقيقية)
INSERT INTO telegram_config (bot_token, chat_id, is_enabled) 
VALUES (
  'YOUR_BOT_TOKEN_HERE',  -- ضع Bot Token هنا
  'YOUR_CHAT_ID_HERE',    -- ضع Chat ID هنا
  true
);
```

### الخطوة 4: اختبار التليجرام

#### 4.1 اختبار الاتصال
```bash
node check_telegram.cjs
```

#### 4.2 اختبار من الواجهة
1. **اذهب إلى صفحة Settings > Telegram**
2. **أضف Bot Token و Chat ID**
3. **اضغط "Test Connection"**

## 📱 أنواع التنبيهات

### 1. **تنبيه تغيير السعر**
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

### 2. **تنبيه خسارة Buy Box**
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

### 3. **تنبيه كسب Buy Box**
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

### إضافة حسابات البائعين الخاصة
```sql
-- جدول حسابات البائعين الخاصة
CREATE TABLE IF NOT EXISTS my_seller_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255),
    region VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة بائع خاص
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES ('Tal2aa Store', 'ae');
```

### تفعيل/تعطيل التنبيهات
```sql
-- تفعيل التليجرام
UPDATE telegram_config SET is_enabled = true;

-- تعطيل التليجرام
UPDATE telegram_config SET is_enabled = false;
```

## 🔧 استكشاف الأخطاء

### مشكلة: لا تصل الإشعارات
1. **تحقق من Bot Token**
2. **تحقق من Chat ID**
3. **تأكد من بدء المحادثة مع البوت**
4. **تحقق من سجلات الباك إند**

### مشكلة: رسائل خطأ
```bash
# تحقق من سجلات الباك إند
npm run backend

# اختبار الاتصال
node check_telegram.cjs
```

## 🎉 النتيجة النهائية

بعد الإعداد، ستتلقى:
- ✅ تنبيهات فورية عند تغيير الأسعار
- ✅ تنبيهات عند خسارة/كسب Buy Box
- ✅ روابط مباشرة للمنتجات
- ✅ معلومات مفصلة عن التغييرات

**التليجرام جاهز للاستخدام!** 🚀 