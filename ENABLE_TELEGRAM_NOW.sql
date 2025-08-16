-- تفعيل التليجرام الآن
-- انسخ هذا الكود والصقه في Supabase SQL Editor

-- 1. تفعيل التليجرام
UPDATE telegram_config 
SET is_enabled = true,
    updated_at = NOW()
WHERE id = 'c86a489a-378a-4868-89eb-11ca76ea8e0e';

-- 2. حذف السجل الفارغ
DELETE FROM telegram_config 
WHERE bot_token = 'EMPTY' OR chat_id = 'EMPTY';

-- 3. عرض الإعدادات الحالية
SELECT '✅ تم تفعيل التليجرام!' as status;
SELECT '📱 الإعدادات الحالية:' as info;
SELECT 
    id,
    CASE 
        WHEN LENGTH(bot_token) > 20 THEN CONCAT(LEFT(bot_token, 20), '...')
        ELSE bot_token 
    END as bot_token_preview,
    chat_id,
    is_enabled,
    created_at,
    updated_at
FROM telegram_config;

-- 4. رسالة نجاح
SELECT '🎉 التليجرام جاهز للاستخدام!' as final_status;
SELECT '📱 ستتلقى تنبيهات عند تغيير الأسعار و Buy Box' as info; 