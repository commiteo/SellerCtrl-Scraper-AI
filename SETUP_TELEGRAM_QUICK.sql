-- إعداد التليجرام السريع
-- انسخ هذا الكود والصقه في Supabase SQL Editor

-- 1. إنشاء جدول إعدادات التليجرام
CREATE TABLE IF NOT EXISTS telegram_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_token VARCHAR(255) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء جدول سجل تنبيهات التليجرام
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

-- 3. إنشاء جدول حسابات البائعين الخاصة
CREATE TABLE IF NOT EXISTS my_seller_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255),
    region VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_telegram_config_enabled ON telegram_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_type ON telegram_alerts(alert_type);

-- 5. إضافة إعدادات تجريبية (استبدل بالقيم الحقيقية)
-- ملاحظة: هذه بيانات تجريبية، يجب استبدالها بالبيانات الحقيقية
INSERT INTO telegram_config (bot_token, chat_id, is_enabled) 
VALUES (
  '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',  -- استبدل بـ Bot Token الحقيقي
  '123456789',                               -- استبدل بـ Chat ID الحقيقي
  true
)
ON CONFLICT (id) DO NOTHING;

-- 6. إضافة بائع تجريبي
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES ('Tal2aa Store', 'ae')
ON CONFLICT (seller_name, region) DO NOTHING;

-- 7. عرض الإعدادات الحالية
SELECT 'Telegram Config:' as info;
SELECT * FROM telegram_config;

SELECT 'My Seller Accounts:' as info;
SELECT * FROM my_seller_accounts;

-- 8. رسالة نجاح
SELECT '✅ تم إعداد جداول التليجرام بنجاح!' as status;
SELECT '📱 الخطوة التالية: استبدل Bot Token و Chat ID بالقيم الحقيقية' as next_step; 