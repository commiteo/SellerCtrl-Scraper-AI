-- 🗄️ إعداد قاعدة البيانات الشامل على Supabase
-- شغل هذا الكود في Supabase SQL Editor

-- ========================================
-- 1. إنشاء الجداول الأساسية
-- ========================================

-- جدول amazon_scraping_history
CREATE TABLE IF NOT EXISTS amazon_scraping_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  title TEXT,
  price DECIMAL(10,2),
  seller VARCHAR(255),
  has_buybox BOOLEAN DEFAULT false,
  total_offers INTEGER DEFAULT 0,
  region VARCHAR(10) DEFAULT 'US',
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_display VARCHAR(50),
  image_url TEXT,
  product_link TEXT,
  data_source VARCHAR(50) DEFAULT 'main_page'
);

-- جدول monitored_products
CREATE TABLE IF NOT EXISTS monitored_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  title TEXT,
  current_price DECIMAL(10,2),
  previous_price DECIMAL(10,2),
  price_change DECIMAL(10,2),
  price_change_percent DECIMAL(5,2),
  current_seller VARCHAR(255),
  has_buybox BOOLEAN DEFAULT false,
  total_offers INTEGER DEFAULT 0,
  region VARCHAR(10) DEFAULT 'US',
  status BOOLEAN DEFAULT true,
  scrape_interval INTEGER DEFAULT 60,
  alert_threshold DECIMAL(5,2) DEFAULT 5.0,
  next_scrape TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_display VARCHAR(50),
  image_url TEXT,
  product_link TEXT
);

-- جدول price_history
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES monitored_products(id) ON DELETE CASCADE,
  asin VARCHAR(20) NOT NULL,
  price DECIMAL(10,2),
  price_display VARCHAR(50),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  region VARCHAR(10) DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول seller_info
CREATE TABLE IF NOT EXISTS seller_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES monitored_products(id) ON DELETE CASCADE,
  asin VARCHAR(20) NOT NULL,
  seller_name VARCHAR(255),
  seller_id VARCHAR(255),
  has_buybox BOOLEAN DEFAULT false,
  buybox_price DECIMAL(10,2),
  total_offers INTEGER DEFAULT 0,
  region VARCHAR(10) DEFAULT 'US',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول telegram_alerts
CREATE TABLE IF NOT EXISTS telegram_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  asin VARCHAR(20) NOT NULL,
  product_title TEXT,
  old_price VARCHAR(50),
  new_price VARCHAR(50),
  price_change DECIMAL(10,2),
  price_change_percentage DECIMAL(5,2),
  region VARCHAR(10),
  message_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول telegram_config
CREATE TABLE IF NOT EXISTS telegram_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_token VARCHAR(255),
  chat_id VARCHAR(255),
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. إنشاء الجداول للميزات المتقدمة
-- ========================================

-- جدول multi_domain_scraping_history
CREATE TABLE IF NOT EXISTS multi_domain_scraping_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  title TEXT,
  price DECIMAL(10,2),
  seller VARCHAR(255),
  has_buybox BOOLEAN DEFAULT false,
  total_offers INTEGER DEFAULT 0,
  region VARCHAR(10),
  domain VARCHAR(50),
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_display VARCHAR(50),
  image_url TEXT,
  product_link TEXT,
  data_source VARCHAR(50) DEFAULT 'main_page'
);

-- جدول price_comparison_results
CREATE TABLE IF NOT EXISTS price_comparison_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  title TEXT,
  price_eg DECIMAL(10,2),
  price_sa DECIMAL(10,2),
  price_ae DECIMAL(10,2),
  price_com DECIMAL(10,2),
  price_de DECIMAL(10,2),
  currency_eg VARCHAR(3) DEFAULT 'EGP',
  currency_sa VARCHAR(3) DEFAULT 'SAR',
  currency_ae VARCHAR(3) DEFAULT 'AED',
  currency_com VARCHAR(3) DEFAULT 'USD',
  currency_de VARCHAR(3) DEFAULT 'EUR',
  best_price DECIMAL(10,2),
  best_domain VARCHAR(10),
  best_currency VARCHAR(3),
  price_difference_percentage DECIMAL(5,2),
  available_domains TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول multi_domain_batches
CREATE TABLE IF NOT EXISTS multi_domain_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  asins TEXT[],
  domains TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  total_products INTEGER DEFAULT 0,
  completed_products INTEGER DEFAULT 0,
  failed_products INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- ========================================
-- 3. إنشاء Indexes للأداء
-- ========================================

-- Indexes لـ amazon_scraping_history
CREATE INDEX IF NOT EXISTS idx_amazon_scraping_asin ON amazon_scraping_history(asin);
CREATE INDEX IF NOT EXISTS idx_amazon_scraping_region ON amazon_scraping_history(region);
CREATE INDEX IF NOT EXISTS idx_amazon_scraping_scraped_at ON amazon_scraping_history(scraped_at);
CREATE INDEX IF NOT EXISTS idx_amazon_scraping_status ON amazon_scraping_history(status);

-- Indexes لـ monitored_products
CREATE INDEX IF NOT EXISTS idx_monitored_products_asin ON monitored_products(asin);
CREATE INDEX IF NOT EXISTS idx_monitored_products_status ON monitored_products(status);
CREATE INDEX IF NOT EXISTS idx_monitored_products_next_scrape ON monitored_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_monitored_products_region ON monitored_products(region);

-- Indexes لـ price_history
CREATE INDEX IF NOT EXISTS idx_price_history_asin ON price_history(asin);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_scraped_at ON price_history(scraped_at);

-- Indexes لـ seller_info
CREATE INDEX IF NOT EXISTS idx_seller_info_asin ON seller_info(asin);
CREATE INDEX IF NOT EXISTS idx_seller_info_product_id ON seller_info(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_info_scraped_at ON seller_info(scraped_at);

-- Indexes لـ telegram_alerts
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_asin ON telegram_alerts(asin);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_alert_type ON telegram_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_telegram_alerts_created_at ON telegram_alerts(created_at);

-- Indexes لـ multi_domain_scraping_history
CREATE INDEX IF NOT EXISTS idx_multi_domain_asin ON multi_domain_scraping_history(asin);
CREATE INDEX IF NOT EXISTS idx_multi_domain_region ON multi_domain_scraping_history(region);
CREATE INDEX IF NOT EXISTS idx_multi_domain_scraped_at ON multi_domain_scraping_history(scraped_at);

-- Indexes لـ price_comparison_results
CREATE INDEX IF NOT EXISTS idx_price_comparison_asin ON price_comparison_results(asin);
CREATE INDEX IF NOT EXISTS idx_price_comparison_created_at ON price_comparison_results(created_at);

-- Indexes لـ multi_domain_batches
CREATE INDEX IF NOT EXISTS idx_batches_status ON multi_domain_batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON multi_domain_batches(created_at);

-- ========================================
-- 4. تفعيل Row Level Security (RLS)
-- ========================================

ALTER TABLE amazon_scraping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_domain_scraping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_comparison_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_domain_batches ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. إنشاء سياسات RLS
-- ========================================

-- سياسات لـ amazon_scraping_history
CREATE POLICY "Enable read access for all users" ON amazon_scraping_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON amazon_scraping_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON amazon_scraping_history FOR UPDATE USING (true);

-- سياسات لـ monitored_products
CREATE POLICY "Enable read access for all users" ON monitored_products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON monitored_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON monitored_products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON monitored_products FOR DELETE USING (true);

-- سياسات لـ price_history
CREATE POLICY "Enable read access for all users" ON price_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON price_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON price_history FOR UPDATE USING (true);

-- سياسات لـ seller_info
CREATE POLICY "Enable read access for all users" ON seller_info FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON seller_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON seller_info FOR UPDATE USING (true);

-- سياسات لـ telegram_alerts
CREATE POLICY "Enable read access for all users" ON telegram_alerts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON telegram_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON telegram_alerts FOR UPDATE USING (true);

-- سياسات لـ telegram_config
CREATE POLICY "Enable read access for all users" ON telegram_config FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON telegram_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON telegram_config FOR UPDATE USING (true);

-- سياسات لـ multi_domain_scraping_history
CREATE POLICY "Enable read access for all users" ON multi_domain_scraping_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON multi_domain_scraping_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON multi_domain_scraping_history FOR UPDATE USING (true);

-- سياسات لـ price_comparison_results
CREATE POLICY "Enable read access for all users" ON price_comparison_results FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON price_comparison_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON price_comparison_results FOR UPDATE USING (true);

-- سياسات لـ multi_domain_batches
CREATE POLICY "Enable read access for all users" ON multi_domain_batches FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON multi_domain_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON multi_domain_batches FOR UPDATE USING (true);

-- ========================================
-- 6. إنشاء Functions و Triggers
-- ========================================

-- Function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function لحساب تغيير السعر
CREATE OR REPLACE FUNCTION calculate_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_price IS NOT NULL AND NEW.current_price IS NOT NULL THEN
        NEW.price_change = NEW.current_price - OLD.current_price;
        NEW.price_change_percent = ((NEW.current_price - OLD.current_price) / OLD.current_price) * 100;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function لتحديث next_scrape
CREATE OR REPLACE FUNCTION update_next_scrape()
RETURNS TRIGGER AS $$
BEGIN
    NEW.next_scrape = NOW() + (NEW.scrape_interval || 60) * INTERVAL '1 minute';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق Triggers
DROP TRIGGER IF EXISTS update_monitored_products_updated_at ON monitored_products;
CREATE TRIGGER update_monitored_products_updated_at
    BEFORE UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seller_info_updated_at ON seller_info;
CREATE TRIGGER update_seller_info_updated_at
    BEFORE UPDATE ON seller_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_telegram_config_updated_at ON telegram_config;
CREATE TRIGGER update_telegram_config_updated_at
    BEFORE UPDATE ON telegram_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS calculate_price_change_trigger ON monitored_products;
CREATE TRIGGER calculate_price_change_trigger
    BEFORE UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_change();

DROP TRIGGER IF EXISTS update_next_scrape_trigger ON monitored_products;
CREATE TRIGGER update_next_scrape_trigger
    BEFORE INSERT OR UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION update_next_scrape();

-- ========================================
-- 7. إنشاء Views للإحصائيات
-- ========================================

-- View لإحصائيات المراقبة
CREATE OR REPLACE VIEW monitoring_stats AS
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE status = true) as active_products,
    COUNT(*) FILTER (WHERE next_scrape <= NOW()) as due_now,
    AVG(price_change_percent) as avg_price_change,
    MAX(updated_at) as last_update
FROM monitored_products;

-- View لإحصائيات السكرابينج
CREATE OR REPLACE VIEW scraping_stats AS
SELECT 
    COUNT(*) as total_scrapes,
    COUNT(*) FILTER (WHERE status = 'success') as successful_scrapes,
    ROUND((COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) as success_rate,
    MAX(scraped_at) as last_scrape
FROM amazon_scraping_history
WHERE scraped_at >= NOW() - INTERVAL '7 days';

-- ========================================
-- 8. إدخال بيانات تجريبية
-- ========================================

-- إدخال إعدادات Telegram الافتراضية
INSERT INTO telegram_config (bot_token, chat_id, is_enabled, created_at, updated_at)
VALUES ('', '', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. التحقق من إنشاء الجداول
-- ========================================

-- عرض جميع الجداول المنشأة
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'amazon_scraping_history',
    'monitored_products',
    'price_history',
    'seller_info',
    'telegram_alerts',
    'telegram_config',
    'multi_domain_scraping_history',
    'price_comparison_results',
    'multi_domain_batches'
)
ORDER BY table_name;

-- عرض عدد السجلات في كل جدول
SELECT 'amazon_scraping_history' as table_name, COUNT(*) as record_count FROM amazon_scraping_history
UNION ALL
SELECT 'monitored_products', COUNT(*) FROM monitored_products
UNION ALL
SELECT 'price_history', COUNT(*) FROM price_history
UNION ALL
SELECT 'seller_info', COUNT(*) FROM seller_info
UNION ALL
SELECT 'telegram_alerts', COUNT(*) FROM telegram_alerts
UNION ALL
SELECT 'telegram_config', COUNT(*) FROM telegram_config
UNION ALL
SELECT 'multi_domain_scraping_history', COUNT(*) FROM multi_domain_scraping_history
UNION ALL
SELECT 'price_comparison_results', COUNT(*) FROM price_comparison_results
UNION ALL
SELECT 'multi_domain_batches', COUNT(*) FROM multi_domain_batches;

-- ========================================
-- ✅ تم إعداد قاعدة البيانات بنجاح!
-- ========================================

-- 📋 ملاحظات مهمة:
-- 1. جميع الجداول تم إنشاؤها مع RLS مفعل
-- 2. جميع السياسات تسمح بالوصول الكامل
-- 3. تم إنشاء Indexes للأداء الأمثل
-- 4. تم إنشاء Triggers للتحديث التلقائي
-- 5. تم إنشاء Views للإحصائيات
-- 6. تم إدخال إعدادات Telegram الافتراضية

-- 🚀 يمكنك الآن استخدام التطبيق مع قاعدة البيانات! 