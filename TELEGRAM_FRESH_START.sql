-- إعداد التليجرام من الصفر - تنظيف كامل وإعادة إعداد
-- انسخ هذا الكود والصقه في Supabase SQL Editor

-- ========================================
-- المرحلة 1: تنظيف قاعدة البيانات
-- ========================================

-- حذف جميع البيانات القديمة
DELETE FROM telegram_config;
DELETE FROM telegram_alerts;
DELETE FROM my_seller_accounts;

-- حذف الجداول وإعادة إنشاؤها
DROP TABLE IF EXISTS telegram_config CASCADE;
DROP TABLE IF EXISTS telegram_alerts CASCADE;
DROP TABLE IF EXISTS my_seller_accounts CASCADE;

-- ========================================
-- المرحلة 2: إنشاء الجداول الجديدة
-- ========================================

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

-- ========================================
-- المرحلة 3: إنشاء Indexes للأداء
-- ========================================

CREATE INDEX idx_telegram_config_enabled ON telegram_config(is_enabled);
CREATE INDEX idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX idx_telegram_alerts_type ON telegram_alerts(alert_type);
CREATE INDEX idx_telegram_alerts_created_at ON telegram_alerts(created_at);
CREATE INDEX idx_my_seller_accounts_name ON my_seller_accounts(seller_name);
CREATE INDEX idx_my_seller_accounts_region ON my_seller_accounts(region);

-- ========================================
-- المرحلة 4: إضافة البيانات الأساسية
-- ========================================

-- إضافة إعدادات التليجرام (استبدل بالقيم الحقيقية)
INSERT INTO telegram_config (bot_token, chat_id, is_enabled) 
VALUES (
  'YOUR_BOT_TOKEN_HERE',  -- ضع Bot Token الحقيقي هنا
  'YOUR_CHAT_ID_HERE',    -- ضع Chat ID الحقيقي هنا
  true
);

-- إضافة البائعين الخاصين
INSERT INTO my_seller_accounts (seller_name, region) 
VALUES 
  ('Tal2aa Store', 'ae'),
  ('Aldwlyah trading', 'ae'),
  ('Amazon', 'ae'),
  ('bareeq.home', 'ae'),
  ('GLOBED', 'ae'),
  ('Tahoun Mart', 'ae');

-- ========================================
-- المرحلة 5: إنشاء Triggers للتحديث التلقائي
-- ========================================

-- Trigger لتحديث updated_at في telegram_config
CREATE OR REPLACE FUNCTION update_telegram_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telegram_config_updated_at_trigger
    BEFORE UPDATE ON telegram_config
    FOR EACH ROW EXECUTE FUNCTION update_telegram_config_updated_at();

-- ========================================
-- المرحلة 6: إنشاء Views مفيدة
-- ========================================

-- View لعرض إحصائيات التنبيهات
CREATE OR REPLACE VIEW telegram_alerts_summary AS
SELECT 
    alert_type,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN message_sent = true THEN 1 END) as sent_alerts,
    COUNT(CASE WHEN message_sent = false THEN 1 END) as failed_alerts,
    MIN(created_at) as first_alert,
    MAX(created_at) as last_alert
FROM telegram_alerts
GROUP BY alert_type;

-- View لعرض التنبيهات اليوم
CREATE OR REPLACE VIEW telegram_alerts_today AS
SELECT 
    alert_type,
    asin,
    product_title,
    old_price,
    new_price,
    price_change_percentage,
    region,
    created_at
FROM telegram_alerts
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- ========================================
-- المرحلة 7: إنشاء Functions مفيدة
-- ========================================

-- Function لحذف التنبيهات القديمة
CREATE OR REPLACE FUNCTION cleanup_old_telegram_alerts(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM telegram_alerts 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function لتفعيل/تعطيل التليجرام
CREATE OR REPLACE FUNCTION toggle_telegram_notifications(enabled BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE telegram_config 
    SET is_enabled = enabled,
        updated_at = NOW();
    
    RETURN enabled;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- المرحلة 8: عرض النتائج
-- ========================================

-- عرض رسالة نجاح
SELECT '🎉 تم إعداد التليجرام بنجاح!' as status;
SELECT '📱 الجداول المُنشأة:' as info;
SELECT '   • telegram_config' as table_name;
SELECT '   • telegram_alerts' as table_name;
SELECT '   • my_seller_accounts' as table_name;

-- عرض الإعدادات الحالية
SELECT '📱 الإعدادات الحالية:' as info;
SELECT 
    id,
    CASE 
        WHEN LENGTH(bot_token) > 20 THEN CONCAT(LEFT(bot_token, 20), '...')
        ELSE bot_token 
    END as bot_token_preview,
    chat_id,
    is_enabled,
    created_at
FROM telegram_config;

-- عرض البائعين الخاصين
SELECT '👤 البائعين الخاصين:' as info;
SELECT seller_name, region, is_active
FROM my_seller_accounts
ORDER BY seller_name;

-- عرض الإحصائيات
SELECT '📊 إحصائيات النظام:' as info;
SELECT 
    (SELECT COUNT(*) FROM telegram_config) as config_count,
    (SELECT COUNT(*) FROM my_seller_accounts) as sellers_count,
    (SELECT COUNT(*) FROM telegram_alerts) as alerts_count;

-- رسالة نهائية
SELECT '🚀 التليجرام جاهز للاستخدام!' as final_status;
SELECT '📱 الخطوة التالية: استبدل Bot Token و Chat ID بالقيم الحقيقية' as next_step; 