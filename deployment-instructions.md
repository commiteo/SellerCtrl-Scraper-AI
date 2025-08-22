# تعليمات النشر على خادم Hostinger

## معلومات الخادم
- **عنوان IP:** 91.108.112.75
- **اسم المستخدم:** root
- **كلمة المرور:** 3lolScar@25#

## الخطوات المطلوبة

### 1. رفع ملف المشروع
- تم إنشاء ملف `sellerctrl-deployment.zip` في مجلد المشروع
- قم برفع هذا الملف إلى الخادم باستخدام:
  - FileZilla أو أي برنامج FTP
  - لوحة تحكم Hostinger
  - أو أي طريقة رفع ملفات أخرى

### 2. الاتصال بالخادم عبر SSH
```bash
ssh root@91.108.112.75
# أدخل كلمة المرور: 3lolScar@25#
```

### 3. إنشاء مجلد المشروع وفك الضغط
```bash
# إنشاء مجلد المشروع
mkdir -p /var/www/sellerctrl

# الانتقال إلى مجلد المشروع
cd /var/www/sellerctrl

# فك ضغط الملف (تأكد من رفع الملف إلى هذا المجلد أولاً)
unzip sellerctrl-deployment.zip

# أو إذا كان الملف في مجلد آخر:
# unzip /path/to/sellerctrl-deployment.zip -d /var/www/sellerctrl/
```

### 4. تثبيت Node.js و npm (إذا لم يكونا مثبتين)
```bash
# تحديث النظام
apt update

# تثبيت Node.js و npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# التحقق من التثبيت
node --version
npm --version
```

### 5. تثبيت PM2 لإدارة العمليات
```bash
npm install -g pm2
```

### 6. تثبيت dependencies للمشروع
```bash
# في مجلد المشروع الرئيسي
cd /var/www/sellerctrl
npm install --production

# تثبيت dependencies للـ backend
cd backend
npm install --production
cd ..
```

### 7. بناء المشروع
```bash
# بناء الـ frontend
npm run build
```

### 8. تشغيل الخدمات باستخدام PM2
```bash
# تشغيل الـ backend
pm2 start backend/server.cjs --name sellerctrl-backend

# تشغيل الـ frontend (preview mode)
pm2 start "npm run preview" --name sellerctrl-frontend

# حفظ إعدادات PM2
pm2 save

# تمكين PM2 للبدء التلقائي عند إعادة تشغيل الخادم
pm2 startup
```

### 9. التحقق من حالة الخدمات
```bash
# عرض حالة جميع العمليات
pm2 status

# عرض logs للـ backend
pm2 logs sellerctrl-backend

# عرض logs للـ frontend
pm2 logs sellerctrl-frontend
```

### 10. إعداد Nginx (اختياري)
إذا كنت تريد استخدام Nginx كـ reverse proxy:

```bash
# تثبيت Nginx
apt install nginx

# إنشاء ملف تكوين للموقع
nano /etc/nginx/sites-available/sellerctrl
```

أضف المحتوى التالي:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # استبدل بالدومين الخاص بك

    location / {
        proxy_pass http://localhost:4173;  # منفذ الـ frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;  # منفذ الـ backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تمكين الموقع
ln -s /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/

# اختبار تكوين Nginx
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

## أوامر مفيدة لإدارة المشروع

### إعادة تشغيل الخدمات
```bash
pm2 restart sellerctrl-backend
pm2 restart sellerctrl-frontend
```

### تحديث المشروع
```bash
# إيقاف الخدمات
pm2 stop all

# رفع الملفات الجديدة وفك الضغط
# ... (كرر خطوات الرفع وفك الضغط)

# تثبيت dependencies الجديدة
npm install --production
cd backend && npm install --production && cd ..

# بناء المشروع
npm run build

# إعادة تشغيل الخدمات
pm2 restart all
```

### مراقبة الأداء
```bash
# مراقبة استخدام الموارد
pm2 monit

# عرض معلومات مفصلة عن عملية معينة
pm2 show sellerctrl-backend
```

## ملاحظات مهمة

1. **قاعدة البيانات:** تأكد من تكوين قاعدة البيانات بشكل صحيح في ملف `.env`
2. **المنافذ:** تأكد من أن المنافذ 3000 (backend) و 4173 (frontend) متاحة
3. **الأمان:** قم بتغيير كلمات المرور الافتراضية وتأمين الخادم
4. **النسخ الاحتياطية:** قم بعمل نسخ احتياطية دورية من قاعدة البيانات والملفات

## استكشاف الأخطاء

### إذا لم تعمل الخدمات:
```bash
# التحقق من logs
pm2 logs

# التحقق من حالة المنافذ
netstat -tlnp | grep :3000
netstat -tlnp | grep :4173

# إعادة تشغيل الخدمات
pm2 restart all
```

### إذا كانت هناك مشاكل في قاعدة البيانات:
- تحقق من إعدادات الاتصال في ملف `.env`
- تأكد من أن قاعدة البيانات تعمل
- راجع logs الخاصة بالـ backend

للمساعدة الإضافية، يمكنك مراجعة ملفات الـ logs أو التواصل مع فريق الدعم.