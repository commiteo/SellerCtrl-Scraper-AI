# 🛡️ حل مشكلة صفحة الأمان في أمازون أمريكا

## المشكلة
أمازون أمريكا يظهر صفحة أمان (security check) تطلب الضغط على "Continue shopping" قبل الوصول للمنتج. هذا يحدث لأن أمازون يكتشف أن السكرابر آلي.

## الحلول المُطبقة

### 1. إضافة headers متقدمة لتجنب الاكتشاف
```javascript
browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: false,
  defaultViewport: null,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
});

// تعيين headers إضافية لتجنب اكتشاف السكرابر
await page.setExtraHTTPHeaders({
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1'
});
```

### 2. التعامل مع صفحة الأمان
```javascript
// التعامل مع صفحة الأمان في أمازون أمريكا
if (region === 'com') {
  console.error('Checking for security page on Amazon.com...');
  const isSecurityPage = await page.evaluate(() => {
    // التحقق من وجود صفحة الأمان
    const securityText = document.body.innerText.toLowerCase();
    return securityText.includes('continue shopping') || 
           securityText.includes('automated test software') ||
           document.querySelector('button[data-action="continue-shopping"]') ||
           document.querySelector('a[href*="continue-shopping"]');
  });
  
  if (isSecurityPage) {
    console.error('Security page detected, attempting to bypass...');
    
    // محاولة الضغط على زر "Continue shopping"
    try {
      const continueButton = await page.$('button[data-action="continue-shopping"], a[href*="continue-shopping"], button:contains("Continue shopping")');
      if (continueButton) {
        console.error('Found continue shopping button, clicking...');
        await continueButton.click();
        await page.waitForTimeout(3000); // انتظار تحميل الصفحة
      } else {
        // محاولة الضغط على أي زر يحتوي على "Continue shopping"
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a'));
          const continueBtn = buttons.find(btn => 
            btn.textContent.toLowerCase().includes('continue shopping')
          );
          if (continueBtn) {
            continueBtn.click();
          }
        });
        await page.waitForTimeout(3000);
      }
      
      // التحقق من أن الصفحة تم تحميلها بنجاح
      const isStillSecurityPage = await page.evaluate(() => {
        const securityText = document.body.innerText.toLowerCase();
        return securityText.includes('continue shopping') || 
               securityText.includes('automated test software');
      });
      
      if (isStillSecurityPage) {
        console.error('Still on security page, trying alternative approach...');
        // محاولة إعادة تحميل الصفحة مع headers مختلفة
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.error('Error handling security page:', error);
    }
  }
}
```

### 3. تحسين timeout والأداء
```javascript
// زيادة timeout للعناصر الأساسية
await Promise.all([
  page.waitForSelector('#productTitle', { timeout: 15000 }),
  page.waitForSelector('#landingImage', { timeout: 15000 }),
  page.waitForSelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice', { timeout: 15000 }),
]);

// انتظار إضافي للصفحة لتحميل
await page.waitForTimeout(2000);
```

## الميزات الجديدة

### 1. تجنب اكتشاف السكرابر
- **Headers متقدمة**: تحاكي المتصفح الحقيقي
- **User Agent**: Chrome حديث
- **Args متقدمة**: تعطيل ميزات قد تكشف السكرابر

### 2. التعامل مع صفحة الأمان
- **كشف الصفحة**: يتحقق من وجود صفحة الأمان
- **الضغط التلقائي**: يضغط على "Continue shopping"
- **محاولات متعددة**: عدة طرق للتعامل مع الصفحة

### 3. تحسين الأداء
- **Timeout أطول**: 15 ثانية بدلاً من 10
- **انتظار إضافي**: للصفحة لتحميل بالكامل
- **معالجة الأخطاء**: أفضل للتعامل مع المشاكل

## أمثلة على النتائج

### قبل الحل:
```
1. يفتح صفحة أمازون أمريكا
2. يظهر "Microsoft Edge is being controlled by automated test software"
3. يطلب الضغط على "Continue shopping"
4. لا يتمكن من السحب
5. ينتهي بخطأ timeout
```

### بعد الحل:
```
1. يفتح صفحة أمازون أمريكا
2. يكتشف صفحة الأمان
3. يضغط تلقائياً على "Continue shopping"
4. ينتظر تحميل الصفحة
5. يبدأ السحب بنجاح
```

## كيفية الاختبار

### 1. سحب منتج من أمازون أمريكا
1. اذهب إلى صفحة **Amazon Scraper**
2. غير المنطقة إلى **USA (.com)**
3. أدخل ASIN منتج من أمازون أمريكا
4. اضغط **Start Scraping**
5. راقب المتصفح - يجب أن يضغط تلقائياً على "Continue shopping"

### 2. التحقق من الأداء
1. راقب لوج السكرابر
2. تحقق من أن الصفحة تم تحميلها بنجاح
3. تحقق من أن البيانات تم استخراجها

### 3. اختبار timeout
1. جرب منتجات مختلفة
2. تحقق من أن timeout كافي
3. تحقق من عدم وجود أخطاء

## الفوائد

1. **تجاوز الأمان**: يتعامل مع صفحة الأمان تلقائياً
2. **أداء محسن**: timeout أطول وانتظار إضافي
3. **موثوقية عالية**: عدة طرق للتعامل مع المشاكل
4. **سهولة الاستخدام**: لا يحتاج تدخل يدوي

## ملاحظات مهمة

1. **صفحة الأمان**: قد تظهر أحياناً حتى مع التحسينات
2. **الضغط التلقائي**: يعمل في معظم الحالات
3. **Timeout**: 15 ثانية كافية لمعظم الصفحات
4. **Headers**: تحاكي المتصفح الحقيقي

## استكشاف الأخطاء

### لا يضغط على "Continue shopping"؟
1. تحقق من أن الصفحة تحتوي على الزر
2. جرب إعادة السحب
3. تحقق من لوج السكرابر

### لا يزال على صفحة الأمان؟
1. تحقق من أن الزر تم الضغط عليه
2. جرب منتج آخر
3. تحقق من إعدادات المنطقة

### timeout قصير؟
1. تحقق من سرعة الإنترنت
2. جرب منتج آخر
3. تحقق من إعدادات السكرابر 