-- إعداد جدول معلومات البائعين
-- Run this in Supabase SQL Editor

-- جدول معلومات البائعين
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

-- جدول تاريخ معلومات البائعين
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

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_seller_info_asin ON seller_info(asin);
CREATE INDEX IF NOT EXISTS idx_seller_info_product_id ON seller_info(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_info_has_buybox ON seller_info(has_buybox);
CREATE INDEX IF NOT EXISTS idx_seller_history_asin ON seller_history(asin);
CREATE INDEX IF NOT EXISTS idx_seller_history_product_id ON seller_history(product_id);

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_seller_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_info_updated_at
    BEFORE UPDATE ON seller_info
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_info_updated_at(); 