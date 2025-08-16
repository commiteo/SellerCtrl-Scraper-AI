-- إعداد جدول إعدادات التليجرام
-- Run this in Supabase SQL Editor

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
    alert_type VARCHAR(50) NOT NULL, -- 'buybox_lost', 'buybox_won', 'price_change'
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
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_created_at ON telegram_alerts(created_at);

-- Trigger لتحديث updated_at
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

-- إدراج إعدادات افتراضية (يجب تحديثها لاحقاً)
INSERT INTO telegram_config (bot_token, chat_id, is_enabled)
VALUES ('YOUR_BOT_TOKEN_HERE', 'YOUR_CHAT_ID_HERE', false)
ON CONFLICT (id) DO NOTHING;

-- عرض الإعدادات الحالية
SELECT 
    id,
    CASE 
        WHEN bot_token = 'YOUR_BOT_TOKEN_HERE' THEN 'NOT_CONFIGURED'
        ELSE 'CONFIGURED'
    END as status,
    is_enabled,
    created_at,
    updated_at
FROM telegram_config; 