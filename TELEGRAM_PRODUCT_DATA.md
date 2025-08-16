# 📦 دليل إرسال بيانات المنتجات للتليجرام

## ✅ **التحديثات الجديدة**

### 🔄 **ما تم تغييره:**
- ❌ **إلغاء الرسائل التلقائية** (بدء/انتهاء المراقبة)
- ❌ **إلغاء تنبيهات تغير الأسعار**
- ❌ **إلغاء تنبيهات Buy Box**
- ✅ **إرسال بيانات المنتج فقط** عند كل عملية scraping
- ✅ **إرسال قائمة المنتجات** عند الطلب

## 📱 **أنواع الرسائل الجديدة**

### 1. **بيانات منتج واحد** 📦
```
📦 Product Data

🆔 ASIN: B0BJ2MXKYV
📝 Title: Hepta Carbamide Cream 10% Urea Cream 50 gm
🌍 Region: SA
💰 Price: SAR45.00
👤 Seller: BEAUTY-ZONE KSA
🏆 Buy Box: ✅ Yes
📊 Total Offers: 5

⏰ Scraped at: 08/01/2025, 09:15:30 PM

🔗 View Product
```

### 2. **قائمة المنتجات** 📋
```
📦 Product List

📊 Total Products: 2
⏰ Time: 08/01/2025, 09:15:30 PM

1. B0BJ2MXKYV - Hepta Carbamide Cream 10% Urea Cream 50 gm
   💰 SAR45.00 | 👤 BEAUTY-ZONE KSA

2. B0B1JDB8RW - Hepta Panthenol Cream For Skin 50 gm
   💰 AED24.00 | 👤 Tal2aa Store
```

## 🚀 **كيفية الاستخدام**

### 1. **إرسال بيانات منتج محدد**
```bash
curl -X POST http://localhost:3001/api/telegram/send-product \
  -H "Content-Type: application/json" \
  -d '{
    "asin": "B0BJ2MXKYV",
    "region": "sa"
  }'
```

### 2. **إرسال قائمة المنتجات**
```bash
curl -X POST http://localhost:3001/api/telegram/send-product-list \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10
  }'
```

### 3. **من JavaScript**
```javascript
// إرسال بيانات منتج
const response = await fetch('/api/telegram/send-product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asin: 'B0BJ2MXKYV',
    region: 'sa'
  })
});

// إرسال قائمة منتجات
const listResponse = await fetch('/api/telegram/send-product-list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 5 })
});
```

## 🔄 **السلوك الجديد**

### **عند تشغيل مراقبة الأسعار:**
1. ✅ **يتم scraping المنتجات**
2. ✅ **يتم حفظ البيانات في قاعدة البيانات**
3. ✅ **يتم إرسال بيانات كل منتج للتليجرام**
4. ✅ **يتم إرسال قائمة المنتجات المحدثة**

### **عند الضغط على "Run Now":**
1. ✅ **يتم تشغيل المراقبة**
2. ✅ **يتم إرسال قائمة المنتجات المحدثة**
3. ❌ **لا يتم إرسال رسائل بدء/انتهاء**

## 📊 **معلومات المنتج المرسلة**

### **البيانات الأساسية:**
- 🆔 **ASIN**: معرف المنتج
- 📝 **Title**: عنوان المنتج
- 🌍 **Region**: المنطقة (SA, AE, EG, etc.)
- 💰 **Price**: السعر الحالي
- 👤 **Seller**: اسم البائع
- 🏆 **Buy Box**: هل لديك Buy Box؟
- 📊 **Total Offers**: عدد العروض الإجمالي

### **معلومات إضافية:**
- ⏰ **وقت الاستخراج**
- 🔗 **رابط المنتج**

## 🛠️ **إعدادات متقدمة**

### **تخصيص الرسائل:**
يمكنك تعديل تنسيق الرسائل في:
```javascript
// في backend/simple_telegram_service.cjs
async sendProductData(productData) {
  // تخصيص الرسالة هنا
}
```

### **تخصيص عدد المنتجات:**
```javascript
// تحديد عدد المنتجات في القائمة
const limit = 5; // أو أي رقم تريده
```

## 🧪 **اختبار النظام**

### **اختبار إرسال بيانات منتج:**
```bash
node -e "
const SimpleTelegramService = require('./backend/simple_telegram_service.cjs');
const telegramService = new SimpleTelegramService();

telegramService.sendProductData({
  asin: 'B0BJ2MXKYV',
  title: 'Test Product',
  region: 'sa',
  price: 'SAR100.00',
  seller_name: 'Test Seller',
  has_buybox: true,
  total_offers: 3
}).then(success => console.log('Success:', success));
"
```

### **اختبار إرسال قائمة:**
```bash
node -e "
const SimpleTelegramService = require('./backend/simple_telegram_service.cjs');
const telegramService = new SimpleTelegramService();

telegramService.sendProductList([
  {
    asin: 'B0BJ2MXKYV',
    title: 'Product 1',
    current_price: 'SAR100.00',
    seller_name: 'Seller 1',
    region: 'sa'
  }
]).then(success => console.log('Success:', success));
"
```

## 📱 **مثال على الرسالة الواردة**

عند إضافة منتج جديد أو تحديث بيانات منتج موجود، ستستلم رسالة مثل:

```
📦 Product Data

🆔 ASIN: B0BJ2MXKYV
📝 Title: Hepta Carbamide Cream 10% Urea Cream 50 gm
🌍 Region: SA
💰 Price: SAR45.00
👤 Seller: BEAUTY-ZONE KSA
🏆 Buy Box: ✅ Yes
📊 Total Offers: 5

⏰ Scraped at: 08/01/2025, 09:15:30 PM

🔗 View Product
```

## 🎯 **الفوائد الجديدة**

1. **📦 معلومات شاملة**: بيانات كاملة عن كل منتج
2. **⏰ تحديثات فورية**: عند كل عملية scraping
3. **🔗 روابط مباشرة**: للوصول للمنتج بسرعة
4. **📊 إحصائيات**: عدد العروض وحالة Buy Box
5. **🎯 تركيز على البيانات**: بدون رسائل مزعجة

## 🚀 **الخطوات التالية**

1. ✅ **تم إلغاء الرسائل التلقائية**
2. ✅ **تم تفعيل إرسال بيانات المنتجات**
3. 🔄 **جرب إضافة منتج جديد**
4. 📱 **تحقق من وصول البيانات للتليجرام**
5. 🎯 **استمتع بالبيانات المفيدة فقط!**

---

**🎉 النظام جاهز لإرسال بيانات المنتجات فقط!** 