# 📱 دليل ضبط التليجرام مع قاعدة البيانات

## ✅ **الحالة الحالية**
- ✅ جدول `telegram_config` موجود في Supabase
- ✅ البيانات مُعدة بالفعل (Bot Token + Chat ID)
- ✅ التليجرام مفعل (`is_enabled: true`)
- ✅ خدمة التليجرام مُحدثة لقراءة من قاعدة البيانات

## 🔧 **البيانات الحالية في قاعدة البيانات**

من الصورة المرفقة، البيانات الموجودة:
```sql
id: c86a489a-378a-4868-89eb-11ca76ea8e0e
bot_token: 8389253470:AAEdLBjnN5CNKmOm2zgL:
chat_id: -1002137745795
is_enabled: TRUE
created_at: 2025-07-26 20:49:14.752214+00
updated_at: 2025-07-31 11:21:40.998179+00
user_id: NULL
```

## 🚀 **كيفية تحديث الإعدادات**

### 1. **من خلال Supabase Dashboard**
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Table Editor**
4. اختر جدول `telegram_config`
5. عدل البيانات المطلوبة:
   - `bot_token`: رمز البوت
   - `chat_id`: معرف المحادثة
   - `is_enabled`: `true` أو `false`

### 2. **من خلال SQL**
```sql
-- تحديث إعدادات التليجرام
UPDATE telegram_config 
SET 
  bot_token = 'YOUR_BOT_TOKEN',
  chat_id = 'YOUR_CHAT_ID',
  is_enabled = true,
  updated_at = NOW()
WHERE id = 'c86a489a-378a-4868-89eb-11ca76ea8e0e';

-- أو إضافة إعدادات جديدة
INSERT INTO telegram_config (bot_token, chat_id, is_enabled, created_at, updated_at)
VALUES ('YOUR_BOT_TOKEN', 'YOUR_CHAT_ID', true, NOW(), NOW());
```

### 3. **من خلال API**
```javascript
// تحديث إعدادات التليجرام
const response = await fetch('/api/telegram/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bot_token: 'YOUR_BOT_TOKEN',
    chat_id: 'YOUR_CHAT_ID',
    is_enabled: true
  })
});
```

## 🧪 **اختبار التليجرام**

### 1. **اختبار من Terminal**
```bash
# اختبار التكوين
node test_telegram_database.cjs

# إعداد قاعدة البيانات
node setup_telegram_database.cjs
```

### 2. **اختبار من الواجهة**
1. اذهب إلى صفحة **Telegram Settings**
2. اضغط على **Test Connection**
3. تحقق من وصول الرسالة

### 3. **اختبار من API**
```bash
curl -X POST http://localhost:3001/api/telegram/test
```

## 📋 **أنواع التنبيهات المدعومة**

### 1. **تنبيهات تغير الأسعار**
- تغير السعر بنسبة 5% أو أكثر
- تفاصيل المنتج والسعر القديم والجديد
- رابط المنتج

### 2. **تنبيهات Buy Box**
- فقدان Buy Box
- الفوز بـ Buy Box
- تفاصيل البائع القديم والجديد

### 3. **تنبيهات النظام**
- بدء مراقبة الأسعار
- انتهاء مراقبة الأسعار
- أخطاء النظام

## 🔍 **مراقبة التنبيهات**

### 1. **جدول `telegram_alerts`**
```sql
-- عرض آخر التنبيهات
SELECT * FROM telegram_alerts 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. **من خلال API**
```bash
# جلب تاريخ التنبيهات
curl http://localhost:3001/api/telegram/alerts
```

### 3. **من الواجهة**
- اذهب إلى صفحة **Telegram Settings**
- شاهد قسم **Alert History**

## ⚙️ **إعدادات متقدمة**

### 1. **تخصيص الرسائل**
يمكنك تعديل تنسيق الرسائل في:
- `backend/simple_telegram_service.cjs`
- `backend/telegram_service.cjs`

### 2. **إعدادات التوقيت**
```javascript
// تخصيص المنطقة الزمنية
timeZone: 'Asia/Dubai' // أو أي منطقة زمنية أخرى
```

### 3. **إعدادات التنسيق**
```javascript
// تنسيق HTML للرسائل
parse_mode: 'HTML',
disable_web_page_preview: true
```

## 🛠️ **استكشاف الأخطاء**

### 1. **مشاكل شائعة**
- **Bot Token غير صحيح**: تحقق من صحة الرمز
- **Chat ID غير صحيح**: تأكد من معرف المحادثة
- **البوت غير مفعل**: تأكد من `is_enabled = true`

### 2. **فحص Logs**
```bash
# مراقبة logs الخادم
npm run backend
```

### 3. **اختبار الاتصال**
```bash
# اختبار مباشر
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"YOUR_CHAT_ID","text":"Test message"}'
```

## 📊 **إحصائيات التليجرام**

### 1. **من قاعدة البيانات**
```sql
-- عدد التنبيهات المرسلة
SELECT COUNT(*) FROM telegram_alerts WHERE message_sent = true;

-- نوع التنبيهات
SELECT alert_type, COUNT(*) 
FROM telegram_alerts 
GROUP BY alert_type;
```

### 2. **من API**
```bash
# إحصائيات التليجرام
curl http://localhost:3001/api/telegram/stats
```

## 🎯 **الخطوات التالية**

1. ✅ **تم ضبط قاعدة البيانات**
2. ✅ **تم اختبار الاتصال**
3. ✅ **التليجرام يعمل بشكل صحيح**
4. 🔄 **جرب إضافة منتج ومراقبة الأسعار**
5. 📱 **تحقق من وصول التنبيهات**

## 📞 **الدعم**

إذا واجهت أي مشاكل:
1. تحقق من logs الخادم
2. اختبر الاتصال باستخدام السكريبتات
3. تحقق من إعدادات Supabase
4. تأكد من صحة Bot Token و Chat ID

---

**🎉 التليجرام جاهز للاستخدام!** 