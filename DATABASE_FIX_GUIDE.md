# 🔧 دليل إصلاح قاعدة البيانات

## 🚨 المشاكل المكتشفة

تم اكتشاف المشاكل التالية في قاعدة البيانات:

1. **❌ جدول `monitored_products` مفقود** - أساسي لـ Price Monitor
2. **❌ جدول `multi_domain_scraping_history` مفقود** - للـ Multi Domain Scraper  
3. **❌ جدول `users` مفقود** - للمصادقة
4. **❌ جدول `user_sessions` مفقود** - لإدارة الجلسات
5. **⚠️ أعمدة مفقودة** في الجداول الموجودة

## 🛠️ خطوات الإصلاح

### الخطوة الأولى: تشغيل SQL Script

1. **اذهب إلى Supabase Dashboard**
   - افتح: https://supabase.com/dashboard
   - اختر مشروعك: `aqkaxcwdcqnwzgvaqtne`

2. **اذهب إلى SQL Editor**
   - اضغط على "SQL Editor" في القائمة الجانبية
   - اضغط "New Query"

3. **انسخ والصق الكود التالي:**

```sql
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
```

4. **اضغط "Run" لتشغيل الكود**

### الخطوة الثانية: التحقق من الإصلاح

بعد تشغيل الكود، قم بتشغيل فحص قاعدة البيانات مرة أخرى:

```bash
node database_check.cjs
```

يجب أن ترى:
- ✅ جميع الجداول موجودة
- ✅ جميع الأعمدة موجودة
- ✅ RLS Policies تعمل

### الخطوة الثالثة: اختبار التطبيق

1. **تشغيل التطبيق:**
```bash
npm run dev:all
```

2. **اختبار Price Monitor:**
   - اذهب إلى: `http://localhost:5173/price-monitor`
   - أضف منتج تجريبي: `B08N5WRWNW`
   - اضغط "Run Now"

3. **اختبار Multi Domain Scraper:**
   - اذهب إلى: `http://localhost:5173/multi-domain`
   - أضف ASIN: `B08N5WRWNW`
   - اختر المناطق واضغط "Start Scraping"

## 🎯 النتائج المتوقعة

بعد الإصلاح:
- ✅ Price Monitor سيعمل بدون أخطاء
- ✅ Multi Domain Scraper سيعمل بدون أخطاء
- ✅ رسائل الخطأ ستكون واضحة وملونة
- ✅ جميع الميزات ستعمل بشكل صحيح

## 🚨 إذا واجهت مشاكل

1. **تحقق من Supabase Dashboard** - تأكد من تشغيل SQL بنجاح
2. **تحقق من Console** - ابحث عن أخطاء في Browser Console
3. **تحقق من Backend Logs** - ابحث عن أخطاء في Terminal
4. **أعد تشغيل التطبيق** - `npm run dev:all`

## 📞 الدعم

إذا استمرت المشاكل، قم بـ:
1. تشغيل `node database_check.cjs` وإرسال النتائج
2. إرسال أي أخطاء تظهر في Console
3. إرسال أي أخطاء تظهر في Backend Terminal 