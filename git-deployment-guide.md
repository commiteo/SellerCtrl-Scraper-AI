# دليل النشر باستخدام Git على خادم Hostinger

## معلومات الخادم
- **عنوان IP:** 91.108.112.75
- **اسم المستخدم:** root
- **كلمة المرور:** 3lolScar@25#
- **رابط GitHub:** https://github.com/commiteo/SellerCtrl-Scraper-AI.git

## خطوات النشر

### 1. الاتصال بالخادم
```bash
ssh root@91.108.112.75
# أدخل كلمة المرور: 3lolScar@25#
```

### 2. إعداد Git (إذا لم يكن مثبتاً)
```bash
# تحديث النظام
apt update

# تثبيت Git
apt install git -y

# التحقق من التثبيت
git --version
```

### 3. استنساخ المشروع (للمرة الأولى)
```bash
# إنشاء مجلد المشاريع
mkdir -p /var/www
cd /var/www

# استنساخ المشروع من GitHub
git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git sellerctrl

# الدخول إلى مجلد المشروع
cd sellerctrl
```

### 4. تحديث المشروع (للمرات التالية)
```bash
# الانتقال إلى مجلد المشروع
cd /var/www/sellerctrl

# إيقاف الخدمات مؤقتاً
pm2 stop all

# سحب آخر التحديثات
git pull origin main

# تثبيت التبعيات الجديدة (إذا وجدت)
npm install --production
cd backend && npm install --production && cd ..

# بناء المشروع
npm run build

# إعادة تشغيل الخدمات
pm2 restart all
```

### 5. إعداد البيئة (للمرة الأولى)
```bash
# تثبيت Node.js و npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# تثبيت PM2
npm install -g pm2

# في مجلد المشروع
cd /var/www/sellerctrl

# تثبيت التبعيات
npm install --production
cd backend && npm install --production && cd ..

# بناء المشروع
npm run build
```

### 6. تشغيل الخدمات (للمرة الأولى)
```bash
# تشغيل الـ backend
pm2 start backend/server.cjs --name sellerctrl-backend

# تشغيل الـ frontend
pm2 start "npm run preview" --name sellerctrl-frontend

# حفظ إعدادات PM2
pm2 save

# تمكين البدء التلقائي
pm2 startup
```

### 7. التحقق من حالة الخدمات
```bash
# عرض حالة الخدمات
pm2 status

# عرض logs
pm2 logs

# مراقبة الأداء
pm2 monit
```

## أوامر سريعة للتحديث

### تحديث سريع
```bash
cd /var/www/sellerctrl && git pull && npm run build && pm2 restart all
```

### تحديث مع تثبيت التبعيات
```bash
cd /var/www/sellerctrl && git pull && npm install --production && cd backend && npm install --production && cd .. && npm run build && pm2 restart all
```

### إعادة تشغيل الخدمات فقط
```bash
pm2 restart all
```

## استكشاف الأخطاء

### إذا فشل git pull
```bash
# التحقق من حالة Git
git status

# إعادة تعيين التغييرات المحلية
git reset --hard HEAD
git clean -fd

# ثم المحاولة مرة أخرى
git pull origin main
```

### إذا لم تعمل الخدمات
```bash
# التحقق من logs
pm2 logs sellerctrl-backend
pm2 logs sellerctrl-frontend

# إعادة تشغيل خدمة معينة
pm2 restart sellerctrl-backend
pm2 restart sellerctrl-frontend

# حذف وإعادة إنشاء الخدمات
pm2 delete all
pm2 start backend/server.cjs --name sellerctrl-backend
pm2 start "npm run preview" --name sellerctrl-frontend
pm2 save
```

### التحقق من المنافذ
```bash
# التحقق من المنافذ المستخدمة
netstat -tlnp | grep :3000  # Backend
netstat -tlnp | grep :4173  # Frontend
```

## ملاحظات مهمة

1. **النسخ الاحتياطية**: قم بعمل نسخة احتياطية من قاعدة البيانات قبل التحديث
2. **ملف .env**: تأكد من وجود ملف .env بالإعدادات الصحيحة
3. **الأذونات**: تأكد من أن المجلدات لها الأذونات المناسبة
4. **المراقبة**: راقب logs بعد كل تحديث للتأكد من عدم وجود أخطاء

## إعداد Nginx (اختياري)
```bash
# تثبيت Nginx
apt install nginx -y

# إنشاء ملف التكوين
nano /etc/nginx/sites-available/sellerctrl
```

أضف التكوين التالي:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تمكين الموقع
ln -s /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

هذا الدليل يوفر طريقة سهلة ومباشرة لنشر وتحديث المشروع باستخدام Git على خادم Hostinger.