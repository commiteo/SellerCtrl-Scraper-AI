# 🚀 تشغيل SellerCtrl على السيرفر - الخطوات السريعة

## الخطوات المطلوبة منك:

### 1️⃣ الاتصال بالسيرفر
```bash
ssh root@91.108.112.75
```

### 2️⃣ تحميل وتشغيل السكريبت التلقائي
```bash
# تحميل السكريبت
wget https://raw.githubusercontent.com/commiteo/SellerCtrl-Scraper-AI/main/auto-deploy.sh

# إعطاء صلاحية التنفيذ
chmod +x auto-deploy.sh

# تشغيل السكريبت
./auto-deploy.sh
```

### 3️⃣ تحديث متغيرات البيئة (مهم جداً!)
```bash
# تحديث ملف Backend .env
nano /var/www/sellerctrl/backend/.env

# تحديث ملف Frontend .env  
nano /var/www/sellerctrl/.env
```

**يجب تحديث هذه القيم:**
- `SUPABASE_URL=` (ضع رابط Supabase الخاص بك)
- `SUPABASE_ANON_KEY=` (ضع المفتاح العام)
- `SUPABASE_SERVICE_ROLE_KEY=` (ضع مفتاح الخدمة)

### 4️⃣ إعادة تشغيل التطبيق
```bash
# إعادة تشغيل العمليات
pm2 restart all

# التحقق من الحالة
pm2 status
```

### 5️⃣ اختبار التطبيق
```bash
# اختبار Backend
curl http://91.108.112.75:3002/health

# اختبار Frontend
curl http://91.108.112.75/
```

---

## ✅ النتيجة المتوقعة:
- **Frontend:** http://91.108.112.75
- **Backend API:** http://91.108.112.75:3002
- **Amazon Scraper:** يعمل بشكل طبيعي

---

## 🔧 إذا واجهت مشاكل:

### مشكلة في Backend:
```bash
pm2 logs sellerctrl-api
pm2 restart sellerctrl-api
```

### مشكلة في Frontend:
```bash
pm2 logs sellerctrl-frontend
pm2 restart sellerctrl-frontend
```

### مشكلة في Chrome:
```bash
google-chrome --version
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1
```

---

## 📱 الخطوات البديلة (إذا لم يعمل السكريبت التلقائي):

### الطريقة اليدوية:

1. **تحديث النظام:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget
```

2. **تثبيت Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **تثبيت Chrome:**
```bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update && sudo apt install -y google-chrome-stable
```

4. **استنساخ المشروع:**
```bash
sudo git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git /var/www/sellerctrl
sudo chown -R $USER:$USER /var/www/sellerctrl
cd /var/www/sellerctrl
```

5. **إعداد Backend:**
```bash
cd backend
npm install
# إنشاء ملف .env (انسخ المحتوى من الدليل المفصل)
```

6. **إعداد Frontend:**
```bash
cd ..
npm install
npm run build
# إنشاء ملف .env (انسخ المحتوى من الدليل المفصل)
```

7. **تثبيت وتشغيل PM2:**
```bash
sudo npm install -g pm2
cd backend && pm2 start server.cjs --name "sellerctrl-api"
cd .. && pm2 serve dist 80 --spa --name "sellerctrl-frontend"
pm2 save && pm2 startup
```

---

## 🎯 الهدف النهائي:
- ✅ لا يوجد localhost في أي مكان
- ✅ كل شيء يعمل على السيرفر 91.108.112.75
- ✅ Amazon Scraper يعمل بشكل طبيعي
- ✅ Frontend و Backend متصلان بشكل صحيح

---

**💡 نصيحة:** احتفظ بهذا الملف مفتوحاً أثناء التنفيذ للرجوع إليه عند الحاجة!