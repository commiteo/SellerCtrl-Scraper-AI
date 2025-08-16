# 🚀 SellerCtrl Scraper AI

## 📖 نظرة عامة

**SellerCtrl Scraper AI** هو تطبيق متقدم ومتكامل لمراقبة المنتجات والمنافسين على منصات التجارة الإلكترونية. يوفر التطبيق أدوات شاملة لاستخراج البيانات، مراقبة الأسعار، وتحليل المنافسين عبر منصات متعددة.

## ✨ الميزات الرئيسية

### 🔍 **استخراج البيانات المتقدم**
- دعم منصات متعددة: Amazon (5 مناطق) + Noon
- استخراج معلومات شاملة: الأسعار، البائعين، التقييمات، الصور
- تجاوز أنظمة الحماية والـ CAPTCHAs

### 💰 **مراقبة الأسعار الذكية**
- مراقبة تلقائية للأسعار على مدار الساعة
- تنبيهات فورية عند تغير الأسعار
- تتبع تاريخ التغييرات والاتجاهات

### 🌐 **مقارنة متعددة المناطق**
- مقارنة الأسعار عبر 5 مناطق Amazon
- تحديد أفضل العروض والفرص
- تحليل استراتيجيات المنافسين

### 📱 **إشعارات Telegram**
- تنبيهات فورية عبر Telegram
- تقارير دورية مفصلة
- إرسال الصور والمعلومات الكاملة

### 📊 **تحليلات متقدمة**
- تحليل اتجاهات السوق
- تقارير الأداء والربحية
- رؤى تنافسية شاملة

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Vite** للبناء السريع
- **shadcn/ui** للمكونات الحديثة
- **Tailwind CSS** للتصميم
- **Recharts** للرسوم البيانية

### Backend
- **Node.js** مع Express
- **Puppeteer** للتحكم في المتصفح
- **Microsoft Edge WebDriver**
- **RESTful APIs**

### قاعدة البيانات
- **Supabase** (PostgreSQL)
- **Real-time subscriptions**
- **Row Level Security**

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
```bash
- Node.js 18+ 
- npm أو yarn
- Microsoft Edge متصفح
- Git
```

### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/SellerCtrl-Scraper.git
cd SellerCtrl-Scraper
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد متغيرات البيئة
```bash
# انسخ ملف المثال
cp .env.example .env

# أدخل معلومات قاعدة البيانات
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. تشغيل التطبيق
```bash
# تشغيل الواجهة والخادم معاً
npm run dev:all

# أو تشغيلهما منفصلين
npm run dev        # الواجهة الأمامية
npm run backend    # الخادم الخلفي
```

## 📱 الاستخدام

### 1. **استخراج بيانات Amazon**
- أدخل ASIN المنتج
- اختر المنطقة المطلوبة
- اضغط "Scrape" للحصول على البيانات

### 2. **مراقبة الأسعار**
- أضف المنتجات للمراقبة
- اضبط تكرار المراقبة
- فعّل التنبيهات

### 3. **المقارنة متعددة المناطق**
- أدخل ASIN واحد
- اختر المناطق للمقارنة
- احصل على تقرير شامل

### 4. **إعداد Telegram**
- احصل على Bot Token
- أدخل Chat ID
- فعّل الإشعارات

## 📊 لقطات الشاشة

### الصفحة الرئيسية
![الصفحة الرئيسية](screenshots/home.png)

### استخراج البيانات
![استخراج البيانات](screenshots/scraper.png)

### مراقبة الأسعار
![مراقبة الأسعار](screenshots/monitor.png)

## 🔧 الإعدادات المتقدمة

### تخصيص Selectors
```javascript
// في backend/amazon_puppeteer.cjs
const selectors = {
  title: '#productTitle',
  price: '.a-price-whole',
  seller: '#merchant-info'
};
```

### إعداد Rate Limiting
```javascript
// في backend/middleware/rateLimit.cjs
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد أقصى 100 طلب
};
```

## 🛡️ الأمان

- 🔐 حماية API Keys في متغيرات البيئة
- 🚫 منع تسريب البيانات الحساسة
- ⚡ Rate limiting للطلبات
- 🛡️ CORS configuration آمن

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع هذه الخطوات:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

## 📞 التواصل

- **المطور:** [اسمك]
- **البريد الإلكتروني:** [email@example.com]
- **GitHub:** [github.com/your-username]
- **LinkedIn:** [linkedin.com/in/your-profile]

## 🔄 التحديثات الأخيرة

### الإصدار 2.0.0
- ✅ إضافة مراقبة الأسعار التلقائية
- ✅ دعم منصة Noon
- ✅ تحسين واجهة المستخدم
- ✅ إضافة تنبيهات Telegram
- ✅ تحسين الأداء والاستقرار

## ⚠️ إخلاء المسؤولية

هذا التطبيق مخصص للأغراض التعليمية والبحثية فقط. يرجى احترام شروط الخدمة الخاصة بالمواقع المستهدفة واستخدام التطبيق بشكل مسؤول.

---

⭐ **إذا أعجبك المشروع، لا تنس إعطاؤه نجمة على GitHub!** ⭐