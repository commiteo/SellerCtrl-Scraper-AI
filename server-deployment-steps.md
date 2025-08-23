# خطوات تشغيل المشروع على السيرفر 91.108.112.75

## الخطوة 1: الاتصال بالسيرفر
```bash
ssh root@91.108.112.75
# أو
ssh username@91.108.112.75
```

## الخطوة 2: تحديث النظام وتثبيت المتطلبات الأساسية
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Git
sudo apt install git -y

# تثبيت curl
sudo apt install curl -y
```

## الخطوة 3: تثبيت Node.js
```bash
# تثبيت Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق من التثبيت
node --version
npm --version
```

## الخطوة 4: تثبيت Chrome للسكرابينغ
```bash
# تحديث قائمة الحزم
sudo apt update

# تثبيت المتطلبات
sudo apt install -y wget gnupg

# إضافة مفتاح Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

# إضافة مستودع Chrome
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# تحديث قائمة الحزم وتثبيت Chrome
sudo apt update
sudo apt install -y google-chrome-stable

# التحقق من التثبيت
google-chrome --version
```

## الخطوة 5: استنساخ المشروع من GitHub
```bash
# الانتقال إلى مجلد الويب
cd /var/www/

# استنساخ المشروع
sudo git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git sellerctrl

# تغيير الملكية
sudo chown -R $USER:$USER /var/www/sellerctrl

# الدخول إلى مجلد المشروع
cd sellerctrl
```

## الخطوة 6: إعداد Backend
```bash
# الدخول إلى مجلد Backend
cd backend

# تثبيت المتطلبات
npm install

# إنشاء ملف .env
cp .env.example .env
# أو إنشاء ملف جديد
nano .env
```

### محتوى ملف .env للـ Backend:
```env
NODE_ENV=production
API_PORT=3002
SUPABASE_URL=https://aqkaxcwdcqnwzgvaqtne.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzA3NTAsImV4cCI6MjA2NzAwNjc1MH0.qY4qa352mSJg13QpZ7gKUVLEK-ujLtFMdG44vIPCDIU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
SCRAPER_TIMEOUT=30000
MAX_CONCURRENT_SCRAPERS=3
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://91.108.112.75
API_RATE_LIMIT=100
LOG_LEVEL=info
```

## الخطوة 7: إعداد Frontend
```bash
# العودة إلى مجلد المشروع الرئيسي
cd ..

# تثبيت متطلبات Frontend
npm install

# إنشاء ملف .env للـ Frontend
nano .env
```

### محتوى ملف .env للـ Frontend:
```env
VITE_API_URL=http://91.108.112.75:3002
VITE_SUPABASE_URL=https://aqkaxcwdcqnwzgvaqtne.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzA3NTAsImV4cCI6MjA2NzAwNjc1MH0.qY4qa352mSJg13QpZ7gKUVLEK-ujLtFMdG44vIPCDIU
```

## الخطوة 8: تثبيت PM2 لإدارة العمليات
```bash
# تثبيت PM2 عالمياً
sudo npm install -g pm2

# التحقق من التثبيت
pm2 --version
```

## الخطوة 9: تشغيل Backend
```bash
# الدخول إلى مجلد Backend
cd backend

# تشغيل Backend باستخدام PM2
pm2 start server.cjs --name "sellerctrl-api" --env production

# التحقق من حالة العملية
pm2 status
pm2 logs sellerctrl-api
```

## الخطوة 10: بناء وتشغيل Frontend
```bash
# العودة إلى مجلد المشروع الرئيسي
cd ..

# بناء المشروع للإنتاج
npm run build

# تثبيت serve لتشغيل الملفات الثابتة
sudo npm install -g serve

# تشغيل Frontend باستخدام PM2
pm2 serve dist 80 --spa --name "sellerctrl-frontend"

# التحقق من حالة العمليات
pm2 status
```

## الخطوة 11: إعداد Nginx (اختياري)
```bash
# تثبيت Nginx
sudo apt install nginx -y

# نسخ إعدادات Nginx
sudo cp deploy/nginx-config /etc/nginx/sites-available/sellerctrl

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/

# حذف الإعداد الافتراضي
sudo rm /etc/nginx/sites-enabled/default

# اختبار إعدادات Nginx
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## الخطوة 12: فتح المنافذ في الجدار الناري
```bash
# تفعيل UFW
sudo ufw enable

# فتح المنافذ المطلوبة
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3002  # Backend API

# التحقق من حالة الجدار الناري
sudo ufw status
```

## الخطوة 13: اختبار التطبيق
```bash
# اختبار Backend API
curl http://91.108.112.75:3002/health

# اختبار Frontend
curl http://91.108.112.75/

# اختبار Amazon Scraper
curl -X POST http://91.108.112.75:3002/api/scrape/amazon \
  -H "Content-Type: application/json" \
  -d '{"asin":"B07HFQKFZ9","region":"us"}'
```

## الخطوة 14: مراقبة العمليات
```bash
# عرض حالة جميع العمليات
pm2 status

# عرض سجلات Backend
pm2 logs sellerctrl-api

# عرض سجلات Frontend
pm2 logs sellerctrl-frontend

# إعادة تشغيل العمليات عند الحاجة
pm2 restart sellerctrl-api
pm2 restart sellerctrl-frontend

# حفظ إعدادات PM2 للتشغيل التلقائي
pm2 save
pm2 startup
```

## الخطوة 15: التحقق النهائي
1. افتح المتصفح واذهب إلى: `http://91.108.112.75`
2. تأكد من تحميل الواجهة بشكل صحيح
3. جرب تسجيل الدخول
4. اختبر Amazon Scraper بإدخال ASIN
5. تأكد من عمل جميع الميزات

## استكشاف الأخطاء

### إذا لم يعمل Backend:
```bash
# التحقق من السجلات
pm2 logs sellerctrl-api

# التحقق من المنفذ
sudo netstat -tlnp | grep 3002

# إعادة تشغيل
pm2 restart sellerctrl-api
```

### إذا لم يعمل Frontend:
```bash
# التحقق من السجلات
pm2 logs sellerctrl-frontend

# التحقق من المنفذ
sudo netstat -tlnp | grep 80

# إعادة تشغيل
pm2 restart sellerctrl-frontend
```

### إذا لم يعمل Chrome:
```bash
# اختبار Chrome
google-chrome --headless --no-sandbox --disable-gpu --dump-dom https://www.google.com

# تثبيت المتطلبات الإضافية
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

---

**ملاحظة مهمة:** تأكد من تحديث جميع متغيرات البيئة بالقيم الصحيحة لـ Supabase قبل التشغيل.

**للمساعدة:** إذا واجهت أي مشاكل، تحقق من السجلات باستخدام `pm2 logs` أو `sudo journalctl -u nginx`.