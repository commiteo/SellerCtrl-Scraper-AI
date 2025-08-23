# 🔐 دليل الاتصال بالسيرفر 91.108.112.75

## المشكلة الحالية:
تم حل مشكلة SSH host key، لكن الاتصال يحتاج إلى مصادقة (كلمة مرور أو مفتاح SSH).

## ✅ الحلول المتاحة:

### الحل 1: استخدام كلمة المرور
```bash
ssh root@91.108.112.75
# ثم أدخل كلمة المرور عندما يُطلب منك
```

### الحل 2: استخدام مفتاح SSH (إذا كان متوفراً)
```bash
ssh -i /path/to/your/private/key root@91.108.112.75
```

### الحل 3: استخدام PuTTY على Windows
1. افتح PuTTY
2. أدخل Host Name: `91.108.112.75`
3. Port: `22`
4. Connection Type: `SSH`
5. اضغط Open
6. أدخل username: `root`
7. أدخل كلمة المرور

### الحل 4: استخدام Windows Terminal مع OpenSSH
```powershell
# في PowerShell أو Command Prompt
ssh root@91.108.112.75
```

## 🚀 بعد الاتصال الناجح:

### 1. تحديث النظام:
```bash
apt update && apt upgrade -y
```

### 2. تحميل وتشغيل السكريبت التلقائي:
```bash
# الطريقة الأولى: تحميل من GitHub
wget https://raw.githubusercontent.com/commiteo/SellerCtrl-Scraper-AI/main/auto-deploy.sh
chmod +x auto-deploy.sh
./auto-deploy.sh
```

### 3. أو النسخ اليدوي للسكريبت:
```bash
# إنشاء ملف السكريبت
nano auto-deploy.sh

# انسخ محتوى السكريبت من الملف auto-deploy.sh في المشروع
# ثم احفظ واخرج (Ctrl+X, Y, Enter)

# إعطاء صلاحية التنفيذ
chmod +x auto-deploy.sh

# تشغيل السكريبت
./auto-deploy.sh
```

## 📋 الخطوات التفصيلية بعد الاتصال:

### الخطوة 1: التحقق من النظام
```bash
# التحقق من نوع النظام
lsb_release -a

# التحقق من المساحة المتاحة
df -h

# التحقق من الذاكرة
free -h
```

### الخطوة 2: تثبيت المتطلبات الأساسية
```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت الأدوات الأساسية
apt install -y curl wget git nano htop
```

### الخطوة 3: تثبيت Node.js
```bash
# تثبيت Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# التحقق من التثبيت
node --version
npm --version
```

### الخطوة 4: تثبيت Chrome
```bash
# إضافة مستودع Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# تحديث وتثبيت Chrome
apt update
apt install -y google-chrome-stable

# تثبيت المتطلبات الإضافية
apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

### الخطوة 5: استنساخ المشروع
```bash
# إنشاء مجلد المشروع
mkdir -p /var/www
cd /var/www

# استنساخ المشروع
git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git sellerctrl
cd sellerctrl
```

### الخطوة 6: إعداد Backend
```bash
cd backend
npm install

# إنشاء ملف .env
cat > .env << 'EOF'
NODE_ENV=production
API_PORT=3002
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
SCRAPER_TIMEOUT=30000
MAX_CONCURRENT_SCRAPERS=3
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://91.108.112.75
API_RATE_LIMIT=100
LOG_LEVEL=info
EOF
```

### الخطوة 7: إعداد Frontend
```bash
cd ..
npm install

# إنشاء ملف .env للـ Frontend
cat > .env << 'EOF'
VITE_API_URL=http://91.108.112.75:3002
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

# بناء المشروع
npm run build
```

### الخطوة 8: تثبيت وإعداد PM2
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل Backend
cd backend
pm2 start server.cjs --name "sellerctrl-api" --env production

# تشغيل Frontend
cd ..
npm install -g serve
pm2 serve dist 80 --spa --name "sellerctrl-frontend"

# حفظ إعدادات PM2
pm2 save
pm2 startup
```

### الخطوة 9: إعداد الجدار الناري
```bash
# تفعيل UFW
ufw --force enable

# فتح المنافذ
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3002  # Backend API

# عرض حالة الجدار الناري
ufw status
```

### الخطوة 10: اختبار التطبيق
```bash
# اختبار Backend
curl http://localhost:3002/health

# اختبار Frontend
curl http://localhost:80

# عرض حالة PM2
pm2 status
pm2 logs
```

## 🔧 استكشاف الأخطاء:

### إذا فشل الاتصال:
1. تأكد من أن السيرفر يعمل
2. تحقق من كلمة المرور
3. تأكد من أن المنفذ 22 مفتوح
4. جرب استخدام PuTTY كبديل

### إذا فشل تثبيت Node.js:
```bash
# طريقة بديلة
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### إذا فشل تثبيت Chrome:
```bash
# طريقة بديلة - تثبيت Chromium
apt install -y chromium-browser
# ثم غيّر CHROME_EXECUTABLE_PATH إلى /usr/bin/chromium-browser
```

## 📞 للمساعدة:
- تحقق من السجلات: `pm2 logs`
- إعادة تشغيل الخدمات: `pm2 restart all`
- مراقبة الموارد: `htop`
- فحص المنافذ: `netstat -tlnp`

---

**ملاحظة:** تأكد من تحديث متغيرات Supabase في ملفات `.env` قبل تشغيل التطبيق!