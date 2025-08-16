# إعداد جداول Price Monitor يدوياً

## المشكلة
يبدو أن جداول Price Monitor غير موجودة في قاعدة البيانات، مما يسبب خطأ "Failed to add product to monitoring".

## الحل

### الخطوة 1: فتح Supabase Dashboard
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `aqkaxcwdcqnwzgvaqtne`

### الخطوة 2: فتح SQL Editor
1. من القائمة الجانبية، انقر على "SQL Editor"
2. انقر على "New query"

### الخطوة 3: نسخ ولصق الكود التالي

```sql
-- Price Monitor Database Setup
-- This file creates the necessary tables for the price monitoring feature

-- Table for monitored products
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

-- Table for price history tracking
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    region VARCHAR(10) NOT NULL
);

-- Table for price alerts
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_asin ON price_monitor_products(asin);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_active ON price_monitor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_next_scrape ON price_monitor_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
```

### الخطوة 4: تشغيل الكود
1. انقر على زر "Run" أو اضغط Ctrl+Enter
2. تأكد من أن جميع الجداول تم إنشاؤها بنجاح

### الخطوة 5: التحقق من الجداول
1. اذهب إلى "Table Editor" من القائمة الجانبية
2. تأكد من وجود الجداول التالية:
   - `price_monitor_products`
   - `price_history`
   - `price_alerts`

### الخطوة 6: إعادة تشغيل التطبيق
1. أوقف التطبيق إذا كان يعمل
2. شغل التطبيق مرة أخرى: `npm run dev`

## التحقق من الإصلاح
بعد إعداد الجداول، جرب إضافة منتج جديد في Price Monitor:
1. اذهب إلى صفحة Price Monitor
2. أدخل ASIN صحيح (10 أحرف)
3. اختر المنطقة
4. انقر على "Add to Monitor"

يجب أن يعمل الآن بدون أخطاء!

## إذا استمرت المشكلة
إذا استمرت المشكلة، تحقق من:
1. أن الجداول تم إنشاؤها بنجاح
2. أن لديك صلاحيات الكتابة على قاعدة البيانات
3. أن إعدادات Supabase صحيحة في `src/lib/supabaseClient.ts` 