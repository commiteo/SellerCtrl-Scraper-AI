-- الحل الشامل - إنشاء جميع الجداول المطلوبة
-- شغل هذا الكود في Supabase SQL Editor

-- 1. حذف الجداول القديمة إذا كانت موجودة
DROP TABLE IF EXISTS multi_domain_scraping_history CASCADE;
DROP TABLE IF EXISTS price_comparison_results CASCADE;
DROP TABLE IF EXISTS multi_domain_batches CASCADE;

-- 2. حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable read access for all users" ON multi_domain_scraping_history;
DROP POLICY IF EXISTS "Enable insert access for all users" ON multi_domain_scraping_history;
DROP POLICY IF EXISTS "Enable update access for all users" ON multi_domain_scraping_history;

DROP POLICY IF EXISTS "Enable read access for all users" ON price_comparison_results;
DROP POLICY IF EXISTS "Enable insert access for all users" ON price_comparison_results;
DROP POLICY IF EXISTS "Enable update access for all users" ON price_comparison_results;

DROP POLICY IF EXISTS "Enable read access for all users" ON multi_domain_batches;
DROP POLICY IF EXISTS "Enable insert access for all users" ON multi_domain_batches;
DROP POLICY IF EXISTS "Enable update access for all users" ON multi_domain_batches;

-- 3. إنشاء جدول النتائج الفردية
CREATE TABLE multi_domain_scraping_history (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(10) NOT NULL,
  title TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  domain VARCHAR(10) NOT NULL,
  seller VARCHAR(255),
  image_url TEXT,
  product_url TEXT,
  data_source VARCHAR(50) DEFAULT 'main_page',
  scraped_at TIMESTAMP DEFAULT NOW(),
  batch_id UUID,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. إنشاء جدول مقارنة الأسعار
CREATE TABLE price_comparison_results (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(10) NOT NULL,
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. إنشاء جدول الباتشات
CREATE TABLE multi_domain_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  asins TEXT[],
  domains TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  total_products INTEGER DEFAULT 0,
  completed_products INTEGER DEFAULT 0,
  failed_products INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- 6. إنشاء Indexes للأداء
CREATE INDEX idx_multi_domain_asin ON multi_domain_scraping_history(asin);
CREATE INDEX idx_multi_domain_batch_id ON multi_domain_scraping_history(batch_id);
CREATE INDEX idx_multi_domain_domain ON multi_domain_scraping_history(domain);
CREATE INDEX idx_multi_domain_scraped_at ON multi_domain_scraping_history(scraped_at);
CREATE INDEX idx_multi_domain_status ON multi_domain_scraping_history(status);

CREATE INDEX idx_price_comparison_asin ON price_comparison_results(asin);
CREATE INDEX idx_price_comparison_created_at ON price_comparison_results(created_at);

CREATE INDEX idx_batches_status ON multi_domain_batches(status);
CREATE INDEX idx_batches_created_at ON multi_domain_batches(created_at);

-- 7. تفعيل RLS
ALTER TABLE multi_domain_scraping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_comparison_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_domain_batches ENABLE ROW LEVEL SECURITY;

-- 8. إنشاء سياسات RLS (تسمح بكل العمليات)
CREATE POLICY "Enable read access for all users" ON multi_domain_scraping_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON multi_domain_scraping_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON multi_domain_scraping_history FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON price_comparison_results FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON price_comparison_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON price_comparison_results FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON multi_domain_batches FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON multi_domain_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON multi_domain_batches FOR UPDATE USING (true);

-- 9. إضافة بيانات اختبار
INSERT INTO multi_domain_scraping_history (asin, title, price, currency, domain, seller, status) VALUES
('B01MUBUOYC', 'Test Product 1', 35.99, 'USD', 'com', 'Test Seller', 'success'),
('B01MUBUOYC', 'Test Product 1', 190.00, 'SAR', 'sa', 'Test Seller', 'success'),
('B01MUBUOYC', 'Test Product 1', 304.00, 'AED', 'ae', 'Test Seller', 'success');

INSERT INTO multi_domain_batches (name, asins, domains, status, total_products, completed_products) VALUES
('Test Batch', ARRAY['B01MUBUOYC'], ARRAY['com', 'sa', 'ae'], 'completed', 3, 3);

-- 10. التحقق من إنشاء الجداول
SELECT 'multi_domain_scraping_history' as table_name, COUNT(*) as record_count FROM multi_domain_scraping_history
UNION ALL
SELECT 'multi_domain_batches' as table_name, COUNT(*) as record_count FROM multi_domain_batches
UNION ALL
SELECT 'price_comparison_results' as table_name, COUNT(*) as record_count FROM price_comparison_results; 