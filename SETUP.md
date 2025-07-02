# دليل إعداد SellerCtrl Scraper AI

## المتطلبات الأساسية

### 1. Node.js و npm
```bash
# تحقق من التثبيت
node --version
npm --version
```

### 2. Python 3.x
```bash
# تحقق من التثبيت
python --version
```

### 3. Redis Server
#### للويندوز:
1. حمل Redis من: https://github.com/microsoftarchive/redis/releases
2. ثبت الملف .msi
3. Redis سيعمل كخدمة ويندوز تلقائياً

#### للتحقق من عمل Redis:
```bash
redis-cli ping
# يجب أن يعطي: PONG
```

## التثبيت والإعداد

### 1. تثبيت التبعيات
```bash
# تثبيت تبعيات Node.js
npm install

# تثبيت concurrently لتشغيل الخوادم معاً
npm install --save-dev concurrently

# تثبيت تبعيات Python
pip install -r requirements.txt
```

### 2. تشغيل التطبيق

#### الخيار الأول: تشغيل كامل (Puppeteer + Redis)
```bash
npm run start
```

#### الخيار الثاني: تشغيل مع Python scraper
```bash
npm run dev:python
```

#### الخيار الثالث: تشغيل يدوي
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (Puppeteer)
npm run scraper-server

# Terminal 3: Backend (Python) - اختياري
npm run python-server
```

## المنافذ المستخدمة

- **Frontend (Vite)**: http://localhost:5173
- **Backend (Puppeteer)**: http://localhost:3001
- **Backend (Python)**: http://localhost:3002
- **Redis**: localhost:6379

## حل المشاكل

### مشكلة: Redis غير متصل
```bash
# تحقق من عمل Redis
redis-cli ping

# إذا لم يعمل، ابدأ Redis
redis-server.exe
```

### مشكلة: منفذ مشغول
```bash
# تحقق من المنافذ المشغولة
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# أوقف العملية المشغلة للمنفذ
taskkill /PID <PID> /F
```

### مشكلة: CAPTCHA
- الملف `solve_captcha.py` يحتاج تكامل مع خدمة حل CAPTCHA
- للاستخدام التجاري، استخدم خدمات مثل 2captcha أو Anti-Captcha

## ملاحظات مهمة

1. **لا تستخدم Docker**: المشروع مُعد للعمل بدون Docker
2. **Redis مطلوب**: للعمل مع job queue system
3. **اختر خادم واحد**: إما Puppeteer أو Python، لا تشغلهما معاً
4. **CAPTCHA**: يحتاج تكامل مع خدمة خارجية للاستخدام الفعلي 