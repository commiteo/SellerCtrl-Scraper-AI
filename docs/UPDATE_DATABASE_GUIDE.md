# دليل تحديث قاعدة البيانات

## 🎯 الهدف
تحديث الجداول الموجودة في Supabase لإضافة معلومات البائعين.

## 📋 التحديثات المطلوبة

### 1. تحديث جدول `price_monitor_products`
إضافة أعمدة جديدة:
- `seller_name`: اسم البائع
- `seller_id`: معرف البائع
- `has_buybox`: هل يملك Buy Box
- `buybox_price`: سعر Buy Box
- `total_offers`: عدد العروض

### 2. إنشاء جداول جديدة
- `seller_info`: أحدث معلومات البائع
- `seller_history`: تاريخ معلومات البائعين

## 🔧 كيفية التحديث

### الخطوة 1: فتح Supabase
1. اذهب لـ **Supabase Dashboard**
2. اختر مشروعك
3. اذهب لـ **SQL Editor**

### الخطوة 2: تشغيل التحديث
1. انسخ محتوى `UPDATE_EXISTING_TABLES.sql`
2. الصقه في SQL Editor
3. اضغط **Run**

### الخطوة 3: التحقق من النتيجة
بعد التشغيل ستظهر:
- ✅ رسالة نجاح التحديث
- ✅ قائمة بالأعمدة الجديدة
- ✅ إحصائيات الجداول

## 📊 ما سيحدث بعد التحديث

### الأعمدة الجديدة في `price_monitor_products`
```sql
seller_name VARCHAR(255)     -- اسم البائع
seller_id VARCHAR(100)       -- معرف البائع
has_buybox BOOLEAN           -- هل يملك Buy Box
buybox_price DECIMAL(10,2)   -- سعر Buy Box
total_offers INTEGER         -- عدد العروض
```

### الجداول الجديدة
```sql
seller_info     -- أحدث معلومات البائع
seller_history  -- تاريخ معلومات البائعين
```

## 🚀 بعد التحديث

### 1. تشغيل النظام
```bash
npm run backend
```

### 2. تفعيل المراقبة
- اذهب لـ Price Monitor
- انقر Start Monitoring
- شاهد معلومات البائعين تظهر

### 3. النتيجة
- ✅ معلومات البائعين في الجدول
- ✅ Buy Box واضح ومميز
- ✅ عدد العروض متاح
- ✅ تحديث تلقائي

## 🔍 التحقق من التحديث

### فحص الأعمدة الجديدة
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'price_monitor_products'
ORDER BY ordinal_position;
```

### فحص الجداول الجديدة
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('seller_info', 'seller_history');
```

## ⚠️ ملاحظات مهمة

1. **لا تفقد البيانات**: التحديث آمن ولا يمس البيانات الموجودة
2. **أعمدة جديدة فقط**: يتم إضافة أعمدة جديدة فقط
3. **قيم افتراضية**: الأعمدة الجديدة ستكون NULL للمنتجات الموجودة
4. **تحديث تلقائي**: ستتحدث عند تشغيل المراقبة

## 🎯 النتيجة النهائية

بعد التحديث:
- ✅ جميع الجداول محدثة
- ✅ معلومات البائعين متاحة
- ✅ Buy Box واضح
- ✅ عدد العروض متاح
- ✅ تاريخ كامل للتغييرات

## 📞 في حالة المشاكل

### إذا فشل التحديث
1. **تحقق من الصلاحيات** في Supabase
2. **تحقق من اتصال الإنترنت**
3. **أعد تشغيل SQL** مرة أخرى

### إذا لم تظهر البيانات
1. **تشغل Backend**: `npm run backend`
2. **تفعل المراقبة**: Start Monitoring
3. **تشغل دورة فورية**: Run Now

الآن قاعدة البيانات جاهزة لمعلومات البائعين! 🏪✨ 