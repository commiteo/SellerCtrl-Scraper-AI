# 🌍 Multi-Domain Scraping System

## 🎯 نظرة عامة

نظام Multi-Domain Scraping الجديد يتيح لك سحب بيانات المنتجات من عدة دول في نفس الوقت ومقارنة الأسعار بينها.

## ✨ الميزات الجديدة

### 1. **سكرابينج متوازي من عدة دول**
- مصر (amazon.eg) 🇪🇬
- السعودية (amazon.sa) 🇸🇦  
- الإمارات (amazon.ae) 🇦🇪
- أمريكا (amazon.com) 🇺🇸
- ألمانيا (amazon.de) 🇩🇪
- بريطانيا (amazon.co.uk) 🇬🇧

### 2. **مقارنة الأسعار التلقائية**
- تحديد أفضل سعر
- حساب الفروق المئوية
- عرض العملات المختلفة

### 3. **قاعدة بيانات منفصلة**
- `multi_domain_scraping_history` - تاريخ السكرابينج
- `price_comparison_results` - نتائج مقارنة الأسعار
- `multi_domain_batches` - دفعات السكرابينج

## 🚀 كيفية الاستخدام

### 1. **الوصول للصفحة**
- اذهب إلى **Product Scraper** في القائمة الجانبية
- اختر **🌍 Multi-Domain**

### 2. **إعداد السكرابينج**
```
📝 Amazon ASINs: B08N5WRWNW, B002QYW8LW

🌍 Select Domains:
☑️ Egypt (amazon.eg)    ☑️ Saudi Arabia (amazon.sa)
☑️ UAE (amazon.ae)      ☑️ USA (amazon.com)

⚙️ Options:
☑️ Compare Prices    ☑️ Find Best Deals
```

### 3. **بدء السكرابينج**
- اضغط **Start Multi-Domain Scraping**
- راقب التقدم في الوقت الفعلي
- شاهد النتائج تظهر تدريجياً

## 📊 عرض النتائج

### **جدول مقارنة الأسعار**
```
🏷️ Product: iPhone 15 Pro (B08N5WRWNW)

┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Domain  │ Price   │ Currency│ Seller  │ Status  │ Action  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 🇪🇬 EG  │ 45,000  │ EGP     │ Amazon  │ ✅      │ [View]  │
│ 🇸🇦 SA  │ 4,200   │ SAR     │ Amazon  │ ✅      │ [View]  │
│ 🇦🇪 AE  │ 4,100   │ AED     │ Amazon  │ ✅      │ [View]  │
│ 🇺🇸 US  │ 999     │ USD     │ Amazon  │ ✅      │ [View]  │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

🏆 Best Price: $999 (USA) - 22% cheaper than Egypt
```

## 🗄️ قاعدة البيانات الجديدة

### **multi_domain_scraping_history**
```sql
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
  data_source VARCHAR(50),
  scraped_at TIMESTAMP DEFAULT NOW(),
  batch_id UUID,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT
);
```

### **price_comparison_results**
```sql
CREATE TABLE price_comparison_results (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(10) NOT NULL,
  title TEXT,
  price_eg DECIMAL(10,2),
  price_sa DECIMAL(10,2),
  price_ae DECIMAL(10,2),
  price_com DECIMAL(10,2),
  price_de DECIMAL(10,2),
  price_uk DECIMAL(10,2),
  best_price DECIMAL(10,2),
  best_domain VARCHAR(10),
  price_difference_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 الملفات الجديدة

### **Frontend**
- `src/pages/MultiDomainScraper.tsx` - صفحة السكرابينج
- `src/services/MultiDomainScraper.ts` - خدمة السكرابينج

### **Backend**
- `backend/multi_domain_scraper.cjs` - سكريبت السكرابينج
- `multi_domain_migration.sql` - ملف قاعدة البيانات

### **Database**
- `multi_domain_scraping_history` - تاريخ السكرابينج
- `price_comparison_results` - نتائج المقارنة
- `multi_domain_batches` - دفعات السكرابينج

## 🎨 واجهة المستخدم

### **تصميم متجاوب**
- عرض محسن للأجهزة المحمولة
- ألوان متناسقة مع التطبيق
- أيقونات واضحة لكل دولة

### **تفاعلية**
- اختيار متعدد للدول
- خيارات قابلة للطي
- أزرار إيقاف ذكية

## ⚡ الأداء

### **سكرابينج متوازي**
- كل domain في process منفصل
- إدارة ذكية للموارد
- معالجة الأخطاء المتقدمة

### **تحسينات**
- Timeout محسن (15 ثانية)
- Retry mechanism
- Error handling شامل

## 🔒 الأمان

### **تجنب الاكتشاف**
- Headers متقدمة
- User Agent محسن
- Args متقدمة

### **معالجة الصفحات الأمنية**
- كشف صفحة الأمان
- الضغط التلقائي على "Continue shopping"
- محاولات متعددة للتعامل

## 📈 التحليلات

### **مقارنة الأسعار**
- تحديد أفضل سعر
- حساب الفروق المئوية
- عرض العملات المختلفة

### **إحصائيات**
- معدل النجاح لكل domain
- وقت الاستجابة
- الأخطاء الشائعة

## 🚀 التطوير المستقبلي

### **المرحلة التالية**
1. **تحويل العملات** - تحويل تلقائي لـ USD
2. **تنبيهات الأسعار** - إشعارات عند انخفاض السعر
3. **تتبع الأسعار** - تاريخ تغير الأسعار
4. **تصدير متقدم** - Excel, JSON, PDF

### **ميزات متقدمة**
1. **Webhook Support** - إشعارات عند انتهاء السكرابينج
2. **API Documentation** - توثيق شامل للـ API
3. **Rate Limiting** - حماية من الاستخدام المفرط
4. **Caching** - تخزين مؤقت للنتائج

## 🛠️ الاستكشاف

### **مشاكل شائعة**
1. **صفحة الأمان** - يتم التعامل معها تلقائياً
2. **منتجات غير متوفرة** - يتم تسجيلها كـ "unavailable"
3. **أخطاء الشبكة** - retry mechanism
4. **timeout** - زيادة الوقت إلى 15 ثانية

### **حلول سريعة**
1. **إعادة المحاولة** - جرب مرة أخرى
2. **تغيير Domain** - جرب domain مختلف
3. **فحص ASIN** - تأكد من صحة ASIN
4. **مراجعة السجلات** - تحقق من console

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من السجلات في console
2. تأكد من صحة ASIN
3. جرب domain واحد أولاً
4. راجع ملف الاستكشاف

---

**🎉 النظام جاهز للاستخدام! جرب سكرابينج متعدد الدول الآن!** 