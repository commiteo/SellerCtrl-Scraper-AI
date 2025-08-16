-- تحديث الجداول الموجودة لإضافة معلومات البائعين
-- Run this in Supabase SQL Editor

-- 1. إضافة أعمدة معلومات البائع لجدول price_monitor_products
ALTER TABLE price_monitor_products 
ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS has_buybox BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS buybox_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_offers INTEGER DEFAULT 0;

-- 2. إنشاء جدول seller_info إذا لم يكن موجود
CREATE TABLE IF NOT EXISTS seller_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    seller_name VARCHAR(255),
    seller_id VARCHAR(100),
    has_buybox BOOLEAN DEFAULT false,
    buybox_price DECIMAL(10,2),
    total_offers INTEGER DEFAULT 0,
    region VARCHAR(10) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول seller_history إذا لم يكن موجود
CREATE TABLE IF NOT EXISTS seller_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    seller_name VARCHAR(255),
    seller_id VARCHAR(100),
    has_buybox BOOLEAN DEFAULT false,
    buybox_price DECIMAL(10,2),
    total_offers INTEGER DEFAULT 0,
    region VARCHAR(10) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_seller_info_asin ON seller_info(asin);
CREATE INDEX IF NOT EXISTS idx_seller_info_product_id ON seller_info(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_info_has_buybox ON seller_info(has_buybox);
CREATE INDEX IF NOT EXISTS idx_seller_history_asin ON seller_history(asin);
CREATE INDEX IF NOT EXISTS idx_seller_history_product_id ON seller_history(product_id);

-- 5. إنشاء index للعمود الجديد في price_monitor_products
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_seller ON price_monitor_products(seller_name);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_buybox ON price_monitor_products(has_buybox);

-- 6. Trigger لتحديث updated_at في seller_info
CREATE OR REPLACE FUNCTION update_seller_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger إذا لم يكن موجود
DROP TRIGGER IF EXISTS trigger_update_seller_info_updated_at ON seller_info;
CREATE TRIGGER trigger_update_seller_info_updated_at
    BEFORE UPDATE ON seller_info
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_info_updated_at();

-- 7. Trigger لتحديث updated_at في price_monitor_products
CREATE OR REPLACE FUNCTION update_price_monitor_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger إذا لم يكن موجود
DROP TRIGGER IF EXISTS trigger_update_price_monitor_products_updated_at ON price_monitor_products;
CREATE TRIGGER trigger_update_price_monitor_products_updated_at
    BEFORE UPDATE ON price_monitor_products
    FOR EACH ROW
    EXECUTE FUNCTION update_price_monitor_products_updated_at();

-- 8. إضافة تعليقات للتوضيح
COMMENT ON COLUMN price_monitor_products.seller_name IS 'اسم البائع الذي يملك Buy Box';
COMMENT ON COLUMN price_monitor_products.seller_id IS 'معرف البائع من Amazon';
COMMENT ON COLUMN price_monitor_products.has_buybox IS 'هل البائع يملك Buy Box';
COMMENT ON COLUMN price_monitor_products.buybox_price IS 'سعر Buy Box';
COMMENT ON COLUMN price_monitor_products.total_offers IS 'عدد العروض الإجمالي';

-- 9. التحقق من وجود الجداول
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('price_monitor_products', 'seller_info', 'seller_history')
ORDER BY table_name, ordinal_position;

-- 10. عرض إحصائيات الجداول
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename IN ('price_monitor_products', 'seller_info', 'seller_history')
ORDER BY tablename, attname; 