-- إضافة أعمدة seller_name و selected_account لجدول price_monitor_products
-- هذا الملف يضيف الأعمدة المطلوبة لعرض بيانات السيلر والحساب المحدد

-- إضافة عمود seller_name إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'seller_name'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN seller_name VARCHAR(255);
        RAISE NOTICE 'Added seller_name column to price_monitor_products';
    ELSE
        RAISE NOTICE 'seller_name column already exists in price_monitor_products';
    END IF;
END $$;

-- إضافة عمود selected_account إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'selected_account'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN selected_account VARCHAR(255);
        RAISE NOTICE 'Added selected_account column to price_monitor_products';
    ELSE
        RAISE NOTICE 'selected_account column already exists in price_monitor_products';
    END IF;
END $$;

-- إضافة عمود seller_id إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN seller_id VARCHAR(255);
        RAISE NOTICE 'Added seller_id column to price_monitor_products';
    ELSE
        RAISE NOTICE 'seller_id column already exists in price_monitor_products';
    END IF;
END $$;

-- إضافة عمود has_buybox إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'has_buybox'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN has_buybox BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added has_buybox column to price_monitor_products';
    ELSE
        RAISE NOTICE 'has_buybox column already exists in price_monitor_products';
    END IF;
END $$;

-- إضافة عمود total_offers إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'total_offers'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN total_offers INTEGER;
        RAISE NOTICE 'Added total_offers column to price_monitor_products';
    ELSE
        RAISE NOTICE 'total_offers column already exists in price_monitor_products';
    END IF;
END $$;

-- إضافة عمود image_url إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'price_monitor_products' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE price_monitor_products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to price_monitor_products';
    ELSE
        RAISE NOTICE 'image_url column already exists in price_monitor_products';
    END IF;
END $$;

-- عرض هيكل الجدول بعد التحديث
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'price_monitor_products' 
ORDER BY ordinal_position; 