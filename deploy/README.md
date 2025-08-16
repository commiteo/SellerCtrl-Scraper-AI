# 🚀 SellerCtrl Scraper - Ubuntu Server Deployment Guide

## 📋 متطلبات الخادم

- **Ubuntu 20.04/22.04 LTS**
- **RAM:** 2GB+ (موصى به 4GB)
- **Storage:** 20GB+ 
- **CPU:** 2+ cores
- **Network:** Stable internet connection
- **Domain:** مطلوب للـ SSL

## 🔧 التثبيت خطوة بخطوة

### الخطوة 1: تثبيت متطلبات النظام

```bash
# تسجيل الدخول للخادم
ssh root@your-server-ip

# تحديث النظام
apt update && apt upgrade -y

# تشغيل سكريبت التثبيت
cd /tmp
wget https://raw.githubusercontent.com/commiteo/SellerCtrl-Scraper-AI/main/deploy/install.sh
chmod +x install.sh
sudo bash install.sh
```

### الخطوة 2: استنساخ المشروع

```bash
# الانتقال لمجلد المشروع
cd /var/www/sellerctrl

# استنساخ المشروع
git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git .

# تغيير الصلاحيات
chown -R sellerctrl:sellerctrl .
```

### الخطوة 3: إعداد التطبيق

```bash
# تشغيل سكريبت الإعداد
bash deploy/setup.sh

# تعديل ملف البيئة
nano .env
# أدخل بيانات Supabase الصحيحة
```

### الخطوة 4: إعداد Nginx

```bash
# نسخ إعدادات Nginx
cp deploy/nginx-config /etc/nginx/sites-available/sellerctrl

# تعديل الدومين
nano /etc/nginx/sites-available/sellerctrl
# غيّر your-domain.com إلى دومينك الفعلي

# تفعيل الموقع
ln -s /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/

# إزالة الموقع الافتراضي
rm /etc/nginx/sites-enabled/default

# اختبار إعدادات Nginx
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

### الخطوة 5: بدء التطبيق

```bash
# بدء التطبيق مع PM2
cd /var/www/sellerctrl
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save
pm2 startup

# تشغيل الأمر المعروض من pm2 startup
```

### الخطوة 6: إعداد SSL

```bash
# تشغيل سكريبت SSL
bash deploy/ssl-setup.sh your-domain.com
```

## 🔍 اختبار التطبيق

### فحص الخدمات:
```bash
# فحص PM2
pm2 status
pm2 logs

# فحص Nginx
systemctl status nginx
nginx -t

# فحص المنافذ
netstat -tlnp | grep :3002
```

### اختبار API:
```bash
# اختبار Backend
curl http://localhost:3002/api/health

# اختبار Frontend
curl http://your-domain.com
```

## 📊 مراقبة التطبيق

### مراقبة PM2:
```bash
# عرض الحالة
pm2 status

# عرض السجلات
pm2 logs sellerctrl-backend
pm2 logs sellerctrl-price-monitor

# إعادة تشغيل
pm2 restart all
```

### مراقبة الموارد:
```bash
# استخدام المعالج والذاكرة
htop

# مساحة القرص
df -h

# حالة الشبكة
netstat -i
```

## 🛠️ الصيانة

### تحديث التطبيق:
```bash
cd /var/www/sellerctrl

# سحب التحديثات
git pull origin main

# تحديث التبعيات
npm install --production

# إعادة بناء Frontend
npm run build

# إعادة تشغيل التطبيق
pm2 restart all
```

### النسخ الاحتياطي:
```bash
# نسخة احتياطية للبيانات
tar -czf backup-$(date +%Y%m%d).tar.gz \
  /var/www/sellerctrl \
  /etc/nginx/sites-available/sellerctrl
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في Puppeteer:
```bash
# تثبيت متطلبات Chrome المفقودة
apt install -y libgbm1 libxshmfence1 libglu1-mesa
```

#### 2. مشكلة في الصلاحيات:
```bash
chown -R sellerctrl:sellerctrl /var/www/sellerctrl
chmod -R 755 /var/www/sellerctrl
```

#### 3. نفاد الذاكرة:
```bash
# زيادة حد الذاكرة في PM2
pm2 restart sellerctrl-backend --max-memory-restart 2G
```

## 📞 الدعم

للمساعدة التقنية:
- GitHub Issues: [https://github.com/commiteo/SellerCtrl-Scraper-AI/issues](https://github.com/commiteo/SellerCtrl-Scraper-AI/issues)
- الوثائق: [README.md](../README.md)
