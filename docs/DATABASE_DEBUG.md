# 🔧 تصحيح مشكلة قاعدة البيانات - Multi-Domain Scraper

## 🚨 **المشكلة:**
البيانات لا تُحفظ في قاعدة البيانات Supabase

## 🛠️ **خطوات التصحيح:**

### **الخطوة 1: اختبار الاتصال بقاعدة البيانات**

1. **اذهب لصفحة Multi-Domain Scraper**
2. **اضغط زر "Test Database"** (في الأعلى بجانب Export Results)
3. **تحقق من Console** (F12 → Console) لرؤية النتائج

### **الخطوة 2: تحقق من رسائل Console**

افتح Developer Tools (F12) وابحث عن هذه الرسائل:

```
🔍 Testing database connection...
✅ Database connection test successful
🧪 Testing database insert...
✅ Database insert test successful
```

أو رسائل الخطأ:

```
❌ Database connection test failed: [error message]
❌ Database insert test failed: [error message]
```

### **الخطوة 3: إذا فشل الاختبار**

#### **أ) مشكلة في RLS Policies:**
```sql
-- في Supabase SQL Editor، شغل هذا:
DROP POLICY IF EXISTS "Enable read access for all users" ON multi_domain_scraping_history;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON multi_domain_scraping_history;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON multi_domain_scraping_history;

CREATE POLICY "Enable read access for all users" ON multi_domain_scraping_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON multi_domain_scraping_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON multi_domain_scraping_history FOR UPDATE USING (true);
```

#### **ب) مشكلة في Table Structure:**
```sql
-- تحقق من وجود الجداول:
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'multi_domain%';

-- تحقق من هيكل الجدول:
\d multi_domain_scraping_history;
```

#### **ج) مشكلة في API Key:**
تحقق من ملف `src/lib/supabaseClient.ts`:
```typescript
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'your-api-key-here';
```

### **الخطوة 4: اختبار Scraping مع Logging**

1. **افتح Console** (F12)
2. **اضغط "Start Multi-Domain Scraping"**
3. **راقب الرسائل:**

```
🚀 Starting multi-domain scraping: {asins: [...], domains: [...], batchId: "..."}
📦 Processing ASIN: B01MUBUOYC
🌐 Scraping B01MUBUOYC from eg...
✅ Successfully scraped B01MUBUOYC from eg: success
🔄 Attempting to save multi-domain results: {count: 5, batchId: "...", results: [...]}
📊 Data to insert: [...]
✅ Successfully saved multi-domain results: {savedCount: 5, batchId: "..."}
💾 Saved 5 results for ASIN B01MUBUOYC
```

### **الخطوة 5: التحقق من البيانات المحفوظة**

في Supabase Dashboard:
1. **اذهب لـ Table Editor**
2. **اختر `multi_domain_scraping_history`**
3. **تحقق من وجود بيانات جديدة**

### **الخطوة 6: إذا استمرت المشكلة**

#### **أ) تحقق من Network Tab:**
1. **افتح Developer Tools** (F12)
2. **اذهب لـ Network tab**
3. **شغل Scraping**
4. **ابحث عن requests لـ Supabase**
5. **تحقق من Status Codes** (يجب أن تكون 200 أو 201)

#### **ب) تحقق من Environment Variables:**
```bash
# في ملف .env
VITE_SUPABASE_URL=https://aqkaxcwdcqnwzgvaqtne.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### **ج) إعادة تشغيل التطبيق:**
```bash
npm run dev
```

## ✅ **علامات النجاح:**

- ✅ **Test Database** يعطي رسالة نجاح
- ✅ **Console** يظهر رسائل حفظ ناجحة
- ✅ **Supabase Table** يحتوي على بيانات جديدة
- ✅ **No Error Messages** في Console

## 🆘 **إذا لم تعمل الحلول:**

1. **تحقق من Supabase Project Settings**
2. **تأكد من أن RLS مفعل**
3. **تحقق من API Keys**
4. **أعد تشغيل التطبيق**
5. **تحقق من Network Connectivity**

## 📞 **للحصول على مساعدة إضافية:**

شارك رسائل الخطأ من Console مع فريق الدعم. 