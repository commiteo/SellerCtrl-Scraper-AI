const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

class SimpleTelegramService {
  constructor() {
    this.config = null;
    this.configPath = path.join(__dirname, 'telegram_config.json');
    this.loadConfig();
  }

  // تحميل الإعدادات من قاعدة البيانات
  async loadConfig() {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading Telegram config from database:', error);
        // Fallback to file if database fails
        return this.loadConfigFromFile();
      }

      if (data) {
        this.config = {
          botToken: data.bot_token,
          chatId: data.chat_id,
          enabled: data.is_enabled
        };
        console.log('✅ Telegram config loaded from database successfully');
        return true;
      } else {
        console.log('⚠️ No Telegram config found in database, using defaults');
        this.config = {
          botToken: process.env.TELEGRAM_BOT_TOKEN || '',
          chatId: process.env.TELEGRAM_CHAT_ID || '',
          enabled: false
        };
        return false;
      }
    } catch (error) {
      console.error('❌ Error loading Telegram config from database:', error);
      // Fallback to file if database fails
      return this.loadConfigFromFile();
    }
  }

  // تحميل الإعدادات من الملف (fallback)
  loadConfigFromFile() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
        console.log('✅ Telegram config loaded from file successfully');
        return true;
      } else {
        console.log('⚠️ No Telegram config found, using defaults');
        this.config = {
          botToken: process.env.TELEGRAM_BOT_TOKEN || '',
          chatId: process.env.TELEGRAM_CHAT_ID || '',
          enabled: false
        };
        return false;
      }
    } catch (error) {
      console.error('❌ Error loading Telegram config from file:', error);
      this.config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
        enabled: false
      };
      return false;
    }
  }

  // حفظ الإعدادات في قاعدة البيانات
  async saveConfig(config) {
    try {
      this.config = { ...this.config, ...config };
      
      // Save to database
      const { error } = await supabase
        .from('telegram_config')
        .upsert([{
          bot_token: this.config.botToken,
          chat_id: this.config.chatId,
          is_enabled: this.config.enabled,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });

      if (error) {
        console.error('❌ Error saving Telegram config to database:', error);
        // Fallback to file
        return this.saveConfigToFile();
      }

      console.log('✅ Telegram config saved to database successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving Telegram config to database:', error);
      // Fallback to file
      return this.saveConfigToFile();
    }
  }

  // حفظ الإعدادات في الملف (fallback)
  saveConfigToFile() {
    try {
      this.config = { ...this.config, ...config };
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ Telegram config saved to file successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving Telegram config to file:', error);
      return false;
    }
  }

  // إرسال رسالة بسيطة
  async sendMessage(message) {
    // Ensure config is loaded
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config.enabled || !this.config.botToken || !this.config.chatId) {
      console.log('⚠️ Telegram not configured or disabled');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Telegram message sent successfully');
        return true;
      } else {
        console.error('❌ Telegram API error:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      return false;
    }
  }

  // إرسال تنبيه تغير السعر
  async sendPriceChangeAlert(alertData) {
    const message = `
💰 <b>Price Change Alert!</b>

📦 <b>Product:</b> ${alertData.product_title || 'Unknown Product'}
🆔 <b>ASIN:</b> ${alertData.asin}
🌍 <b>Region:</b> ${alertData.region?.toUpperCase() || 'Unknown'}
👤 <b>Seller:</b> ${alertData.seller_name || 'Unknown'}

💵 <b>Old Price:</b> ${alertData.old_price || 'N/A'}
💵 <b>New Price:</b> ${alertData.new_price || 'N/A'}
📊 <b>Change:</b> ${alertData.price_change > 0 ? '+' : ''}${alertData.price_change?.toFixed(2) || '0'} (${alertData.price_change_percentage > 0 ? '+' : ''}${alertData.price_change_percentage?.toFixed(1) || '0'}%)

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}

🔗 <a href="https://amazon.${alertData.region || 'com'}/dp/${alertData.asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  // إرسال تنبيه فقدان Buy Box
  async sendBuyBoxLostAlert(alertData) {
    const message = `
🚨 <b>Buy Box Lost!</b>

📦 <b>Product:</b> ${alertData.product_title || 'Unknown Product'}
🆔 <b>ASIN:</b> ${alertData.asin}
🌍 <b>Region:</b> ${alertData.region?.toUpperCase() || 'Unknown'}

👤 <b>Previous Seller:</b> ${alertData.old_seller || 'Unknown'}
👤 <b>New Seller:</b> ${alertData.new_seller || 'Unknown'}
💰 <b>Price:</b> ${alertData.price || 'N/A'}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}

🔗 <a href="https://amazon.${alertData.region || 'com'}/dp/${alertData.asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  // إرسال تنبيه الفوز بـ Buy Box
  async sendBuyBoxWonAlert(alertData) {
    const message = `
🎉 <b>Buy Box Won!</b>

📦 <b>Product:</b> ${alertData.product_title || 'Unknown Product'}
🆔 <b>ASIN:</b> ${alertData.asin}
🌍 <b>Region:</b> ${alertData.region?.toUpperCase() || 'Unknown'}

👤 <b>Previous Seller:</b> ${alertData.old_seller || 'Unknown'}
👤 <b>Our Seller:</b> ${alertData.new_seller || 'Unknown'}
💰 <b>Price:</b> ${alertData.price || 'N/A'}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}

🔗 <a href="https://amazon.${alertData.region || 'com'}/dp/${alertData.asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  // اختبار الاتصال
  async testConnection() {
    // Ensure config is loaded
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config.enabled || !this.config.botToken || !this.config.chatId) {
      return {
        success: false,
        error: 'Telegram not configured or disabled'
      };
    }

    try {
      const testMessage = `
🧪 <b>Telegram Test Message</b>

✅ <b>Connection Test Successful!</b>
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}

🎯 <b>Bot Token:</b> ${this.config.botToken ? '✅ Configured' : '❌ Missing'}
💬 <b>Chat ID:</b> ${this.config.chatId ? '✅ Configured' : '❌ Missing'}
    `.trim();

      const success = await this.sendMessage(testMessage);
      
      return {
        success: success,
        error: success ? null : 'Failed to send test message'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // حفظ سجل التنبيهات
  async saveAlertLog(alertData) {
    try {
      const { error } = await supabase
        .from('telegram_alerts')
        .insert({
          alert_type: alertData.alert_type,
          asin: alertData.asin,
          product_title: alertData.product_title,
          old_price: alertData.old_price,
          new_price: alertData.new_price,
          price_change: alertData.price_change,
          price_change_percentage: alertData.price_change_percentage,
          region: alertData.region,
          message_sent: alertData.message_sent || true,
          sent_at: alertData.sent_at || new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving alert log:', error);
        return false;
      }

      console.log('✅ Alert log saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving alert log:', error);
      return false;
    }
  }

  // الحصول على إحصائيات التنبيهات
  async getAlertStats() {
    try {
      const { data, error } = await supabase
        .from('telegram_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error getting alert stats:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('❌ Error getting alert stats:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال بيانات المنتج فقط
  async sendProductData(productData) {
    // Ensure config is loaded
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config.enabled || !this.config.botToken || !this.config.chatId) {
      console.log('⚠️ Telegram not configured or disabled');
      return false;
    }

    try {
      // Check if product has image
      const hasImage = productData.image_url && productData.image_url.startsWith('http');
      
      console.log(`🔍 Debug - Product image_url: ${productData.image_url}`);
      console.log(`🔍 Debug - Has image: ${hasImage}`);
      
      const message = `
📦 <b>Product Data</b>

🆔 <b>ASIN:</b> ${productData.asin}
📝 <b>Title:</b> ${productData.title || 'Unknown Product'}
🌍 <b>Region:</b> ${productData.region?.toUpperCase() || 'Unknown'}
💰 <b>Price:</b> ${productData.price || 'N/A'}
👤 <b>Seller:</b> ${productData.seller_name || 'Unknown'}
🏆 <b>Buy Box:</b> ${productData.has_buybox ? '✅ Yes' : '❌ No'}
👤 <b>My Account:</b> ${productData.my_account || 'N/A'}

⏰ <b>Scraped at:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}

🔗 <a href="https://amazon.${productData.region || 'com'}/dp/${productData.asin}">View Product</a>
      `.trim();

      // Only send photo message if image is available
      if (hasImage) {
        console.log(`📤 Sending photo message with image: ${productData.image_url}`);
        
        const photoUrl = `https://api.telegram.org/bot${this.config.botToken}/sendPhoto`;
        const photoBody = {
          chat_id: this.config.chatId,
          photo: productData.image_url,
          caption: message,
          parse_mode: 'HTML'
        };

        const photoResponse = await fetch(photoUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(photoBody)
        });

        const photoResult = await photoResponse.json();
        
        if (photoResult.ok) {
          console.log('✅ Product data with image sent to Telegram successfully');
          return true;
        } else {
          console.error('❌ Telegram photo API error:', photoResult);
          console.log('⚠️ Skipping product data - image required but failed to send');
          return false;
        }
      } else {
        console.log('⚠️ Skipping product data - no image available');
        return false;
      }

    } catch (error) {
      console.error('❌ Error sending product data to Telegram:', error);
      return false;
    }
  }

  // إرسال قائمة منتجات
  async sendProductList(products) {
    // Ensure config is loaded
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config.enabled || !this.config.botToken || !this.config.chatId) {
      console.log('⚠️ Telegram not configured or disabled');
      return false;
    }

    try {
      if (!products || products.length === 0) {
        const message = `
📦 <b>Product List</b>

📭 <b>No products found</b>
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}
        `.trim();

        return await this.sendMessage(message);
      }

      const productList = products.map((product, index) => {
        return `${index + 1}. <b>${product.asin}</b> - ${product.title || 'Unknown Product'}
   💰 ${product.price || 'N/A'} | 👤 ${product.seller_name || 'Unknown'}`;
      }).join('\n\n');

      const message = `
📦 <b>Product List</b>

📊 <b>Total Products:</b> ${products.length}
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}

${productList}
      `.trim();

      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Product list sent to Telegram successfully');
        return true;
      } else {
        console.error('❌ Telegram API error:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending product list to Telegram:', error);
      return false;
    }
  }
}

module.exports = SimpleTelegramService; 