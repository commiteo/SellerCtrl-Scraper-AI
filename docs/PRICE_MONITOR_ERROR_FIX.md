# إصلاح خطأ "Failed to add product to monitoring"

## المشكلة
عند محاولة إضافة منتج للمراقبة في صفحة Price Monitor، تظهر رسالة خطأ:
```
Failed to add product to monitoring
```

## السبب
الجداول المطلوبة لـ Price Monitor غير موجودة في قاعدة البيانات Supabase.

## الحل السريع

### الطريقة 1: الإعداد اليدوي (مُوصى به)

1. **افتح Supabase Dashboard**
   - اذهب إلى [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - اختر مشروعك: `aqkaxcwdcqnwzgvaqtne`

2. **افتح SQL Editor**
   - من القائمة الجانبية، انقر على "SQL Editor"
   - انقر على "New query"

3. **انسخ والصق الكود التالي:**

```sql
-- Price Monitor Database Setup
CREATE TABLE IF NOT EXISTS price_monitor_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asin VARCHAR(10) NOT NULL,
    title TEXT,
    current_price DECIMAL(10,2),
    previous_price DECIMAL(10,2),
    price_change DECIMAL(10,2),
    price_change_percentage DECIMAL(5,2),
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_scrape TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    region VARCHAR(10) NOT NULL DEFAULT 'eg',
    scrape_interval INTEGER NOT NULL DEFAULT 60,
    alert_threshold DECIMAL(5,2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    region VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change DECIMAL(10,2) NOT NULL,
    price_change_percentage DECIMAL(5,2) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_asin ON price_monitor_products(asin);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_active ON price_monitor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_next_scrape ON price_monitor_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
```

4. **شغل الكود**
   - انقر على زر "Run" أو اضغط Ctrl+Enter

5. **تحقق من الجداول**
   - اذهب إلى "Table Editor"
   - تأكد من وجود الجداول الثلاثة

### الطريقة 2: استخدام ملف SQL

1. **افتح ملف `SIMPLE_PRICE_MONITOR_SETUP.sql`**
2. **انسخ المحتوى**
3. **الصقه في SQL Editor**
4. **شغل الكود**

## التحقق من الإصلاح

بعد إنشاء الجداول:

1. **أعد تشغيل التطبيق**
   ```bash
   npm run dev
   ```

2. **جرب إضافة منتج**
   - اذهب إلى Price Monitor
   - أدخل ASIN صحيح (مثل: B09LH36816)
   - اختر المنطقة
   - انقر "Add to Monitor"

3. **يجب أن يعمل بدون أخطاء**

## إذا استمرت المشكلة

### تحقق من:
1. **إعدادات Supabase**
   - تأكد من أن `src/lib/supabaseClient.ts` يحتوي على البيانات الصحيحة
   - تحقق من أن API Key صحيح

2. **صلاحيات قاعدة البيانات**
   - تأكد من أن لديك صلاحيات الكتابة على الجداول

3. **اتصال الإنترنت**
   - تأكد من أن الاتصال بالإنترنت مستقر

### رسائل الخطأ المحسنة

تم تحديث رسائل الخطأ لتكون أكثر وضوحاً:
- `Database tables not found` - الجداول غير موجودة
- `Database connection error` - خطأ في الاتصال
- `Database error: [تفاصيل]` - خطأ محدد في قاعدة البيانات

## الدعم

إذا استمرت المشكلة، راجع:
- ملف `PRICE_MONITOR_MANUAL_SETUP.md` للتعليمات التفصيلية
- ملف `PRICE_MONITOR_README.md` للاستخدام 