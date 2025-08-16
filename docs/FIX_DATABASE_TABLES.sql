-- Fix Database Tables SQL
-- إصلاح قاعدة البيانات وإنشاء الجداول المفقودة

-- 1. إنشاء جدول monitored_products
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
  user_id UUID,
  price_display VARCHAR(50),
  image_url TEXT,
  product_link TEXT
);

-- 2. إنشاء جدول multi_domain_scraping_history
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
  user_id UUID,
  price_display VARCHAR(50),
  image_url TEXT,
  product_link TEXT
);

-- 3. إنشاء جدول users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- 4. إنشاء جدول user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 5. إضافة أعمدة مفقودة لـ price_history
ALTER TABLE price_history 
ADD COLUMN IF NOT EXISTS price_display VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 6. إضافة أعمدة مفقودة لـ seller_info
ALTER TABLE seller_info 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS buybox_price_display VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 7. إنشاء Indexes
CREATE INDEX IF NOT EXISTS idx_monitored_products_asin ON monitored_products(asin);
CREATE INDEX IF NOT EXISTS idx_monitored_products_status ON monitored_products(status);
CREATE INDEX IF NOT EXISTS idx_monitored_products_next_scrape ON monitored_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_multi_domain_asin ON multi_domain_scraping_history(asin);
CREATE INDEX IF NOT EXISTS idx_multi_domain_region ON multi_domain_scraping_history(region);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- 8. Enable RLS on all tables
ALTER TABLE monitored_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_domain_scraping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies for monitored_products
DROP POLICY IF EXISTS "Users can view their own monitored products" ON monitored_products;
CREATE POLICY "Users can view their own monitored products" ON monitored_products
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own monitored products" ON monitored_products;
CREATE POLICY "Users can insert their own monitored products" ON monitored_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own monitored products" ON monitored_products;
CREATE POLICY "Users can update their own monitored products" ON monitored_products
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own monitored products" ON monitored_products;
CREATE POLICY "Users can delete their own monitored products" ON monitored_products
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS Policies for multi_domain_scraping_history
DROP POLICY IF EXISTS "Users can view their own scraping history" ON multi_domain_scraping_history;
CREATE POLICY "Users can view their own scraping history" ON multi_domain_scraping_history
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own scraping history" ON multi_domain_scraping_history;
CREATE POLICY "Users can insert their own scraping history" ON multi_domain_scraping_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Create RLS Policies for users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 12. Create RLS Policies for user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 13. إضافة بيانات تجريبية لـ telegram_config إذا لم تكن موجودة
INSERT INTO telegram_config (bot_token, chat_id, is_enabled, created_at, updated_at)
VALUES ('', '', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 14. إنشاء Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق Trigger على الجداول
DROP TRIGGER IF EXISTS update_monitored_products_updated_at ON monitored_products;
CREATE TRIGGER update_monitored_products_updated_at
    BEFORE UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. إنشاء Function لحساب تغيير السعر
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

-- تطبيق Trigger على monitored_products
DROP TRIGGER IF EXISTS calculate_price_change_trigger ON monitored_products;
CREATE TRIGGER calculate_price_change_trigger
    BEFORE UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_change();

-- 16. إنشاء View للإحصائيات
CREATE OR REPLACE VIEW monitoring_stats AS
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE status = true) as active_products,
    COUNT(*) FILTER (WHERE next_scrape <= NOW()) as due_now,
    AVG(price_change_percent) as avg_price_change,
    MAX(updated_at) as last_update
FROM monitored_products;

-- 17. إنشاء Function لتحديث next_scrape
CREATE OR REPLACE FUNCTION update_next_scrape()
RETURNS TRIGGER AS $$
BEGIN
    NEW.next_scrape = NOW() + (NEW.scrape_interval || 60) * INTERVAL '1 minute';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق Trigger على monitored_products
DROP TRIGGER IF EXISTS update_next_scrape_trigger ON monitored_products;
CREATE TRIGGER update_next_scrape_trigger
    BEFORE INSERT OR UPDATE ON monitored_products
    FOR EACH ROW
    EXECUTE FUNCTION update_next_scrape();

-- 18. إنشاء Function لتنظيف الجلسات المنتهية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- 19. إنشاء Cron Job لتنظيف الجلسات (إذا كان متاحاً)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- 20. إنشاء Function للحصول على إحصائيات السكرابينج
CREATE OR REPLACE FUNCTION get_scraping_stats(days INTEGER DEFAULT 7)
RETURNS TABLE (
    total_scrapes BIGINT,
    successful_scrapes BIGINT,
    success_rate DECIMAL(5,2),
    avg_response_time DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_scrapes,
        COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_scrapes,
        ROUND((COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) as success_rate,
        0::DECIMAL(10,2) as avg_response_time
    FROM amazon_scraping_history
    WHERE scraped_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$ language 'plpgsql';

-- تم الانتهاء من إصلاح قاعدة البيانات
-- يمكنك الآن تشغيل هذا الملف في Supabase SQL Editor 