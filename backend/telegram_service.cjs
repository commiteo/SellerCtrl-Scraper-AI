const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

class TelegramService {
  constructor() {
    this.config = null;
    // لا نستدعي loadConfig هنا لأنها async
  }

  async loadConfig() {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Telegram config:', error);
        return;
      }

      this.config = data;
      console.log('📱 Telegram config loaded:', data ? 'enabled' : 'not configured');
    } catch (error) {
      console.error('Error loading Telegram config:', error);
    }
  }

  async ensureConfigLoaded() {
    if (!this.config) {
      await this.loadConfig();
    }
  }

  async isMySeller(sellerName) {
    try {
      const { data, error } = await supabase
        .from('my_seller_accounts')
        .select('seller_name')
        .eq('seller_name', sellerName);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if seller is mine:', error);
      return false;
    }
  }

  async sendMessage(message) {
    await this.ensureConfigLoaded();
    
    if (!this.config || !this.config.is_enabled || !this.config.bot_token || !this.config.chat_id) {
      console.log('📱 Telegram notifications are disabled or not configured');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.bot_token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chat_id,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error('📱 Telegram API error:', result);
        return false;
      }

      console.log('✅ Telegram message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  async sendBuyBoxLostAlert(alert) {
    // التحقق من أن البائع الجديد ليس من البائعين الخاصين بك
    const isNewSellerMine = await this.isMySeller(alert.new_seller);
    if (isNewSellerMine) {
      console.log(`🚫 Skipping alert - new seller "${alert.new_seller}" is my seller`);
      return false;
    }

    const message = `
🚨 <b>Buy Box Lost Alert!</b>

📦 <b>Product:</b> ${alert.product_title}
🆔 <b>ASIN:</b> ${alert.asin}
💰 <b>Price:</b> ${alert.price}
🌍 <b>Region:</b> ${alert.region.toUpperCase()}

👤 <b>Previous Seller:</b> ${alert.old_seller}
🏆 <b>New Buy Box Winner:</b> ${alert.new_seller}

⏰ <b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}

🔗 <a href="https://amazon.${alert.region}/dp/${alert.asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  async sendBuyBoxWonAlert(alert) {
    const message = `
🎉 <b>Buy Box Won!</b>

📦 <b>Product:</b> ${alert.product_title}
🆔 <b>ASIN:</b> ${alert.asin}
💰 <b>Price:</b> ${alert.price}
🌍 <b>Region:</b> ${alert.region.toUpperCase()}

👤 <b>Previous Seller:</b> ${alert.old_seller}
🏆 <b>New Buy Box Winner:</b> ${alert.new_seller}

⏰ <b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}

🔗 <a href="https://amazon.${alert.region}/dp/${alert.asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  async sendPriceChangeAlert(
    asin,
    productTitle,
    oldPrice,
    newPrice,
    priceChange,
    priceChangePercentage,
    region,
    sellerName
  ) {
    const message = `
💰 <b>Price Change Alert!</b>

📦 <b>Product:</b> ${productTitle}
🆔 <b>ASIN:</b> ${asin}
🌍 <b>Region:</b> ${region.toUpperCase()}
👤 <b>Seller:</b> ${sellerName}

💵 <b>Old Price:</b> ${oldPrice}
💵 <b>New Price:</b> ${newPrice}
📊 <b>Change:</b> ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercentage > 0 ? '+' : ''}${priceChangePercentage.toFixed(1)}%)

⏰ <b>Time:</b> ${new Date().toLocaleString()}

🔗 <a href="https://amazon.${region}/dp/${asin}">View Product</a>
    `.trim();

    return await this.sendMessage(message);
  }

  async testConnection() {
    const testMessage = `
🧪 <b>Telegram Test Message</b>

✅ Your Telegram notifications are working correctly!
⏰ <b>Time:</b> ${new Date().toLocaleString()}

🎯 You will receive alerts for:
• Buy Box losses
• Buy Box wins
• Price changes
• Important updates
    `.trim();

    return await this.sendMessage(testMessage);
  }

  // حفظ سجل التنبيه في قاعدة البيانات
  async saveAlertLog(alertData) {
    try {
      const { error } = await supabase
        .from('telegram_alerts')
        .insert([alertData]);

      if (error) throw error;
      console.log('📝 Alert log saved to database');
    } catch (error) {
      console.error('Error saving alert log:', error);
    }
  }

  async sendProductUpdateAlert(productData) {
    await this.ensureConfigLoaded();
    
    const {
      asin,
      title,
      current_price,
      seller_name,
      has_buybox,
      total_offers,
      region,
      image_url,
      price_change,
      price_change_percentage,
      selected_account
    } = productData;

    const buyboxStatus = has_buybox ? '✅ Has Buy Box' : '❌ No Buy Box';
    const priceChangeText = price_change ? 
      `${price_change > 0 ? '+' : ''}${price_change.toFixed(2)} (${price_change_percentage > 0 ? '+' : ''}${price_change_percentage.toFixed(1)}%)` : 
      'No change';

    const message = `
📦 <b>Product Update Alert</b>

🆔 <b>ASIN:</b> ${asin}
📝 <b>Title:</b> ${title || 'N/A'}
💰 <b>Price:</b> ${current_price || 'N/A'}
🌍 <b>Region:</b> ${region?.toUpperCase() || 'N/A'}

👤 <b>Seller:</b> ${seller_name || 'N/A'}
🏆 <b>Buy Box:</b> ${buyboxStatus}
📊 <b>Total Offers:</b> ${total_offers || 'N/A'}

👤 <b>My Account:</b> ${selected_account || 'N/A'}

📈 <b>Price Change:</b> ${priceChangeText}

⏰ <b>Updated:</b> ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}

🔗 <a href="https://amazon.${region}/dp/${asin}">View Product</a>
    `.trim();

    // إرسال الرسالة النصية
    const textResult = await this.sendMessage(message);

    // إرسال صورة المنتج إذا كانت متوفرة
    if (image_url) {
      try {
        const photoMessage = `
📦 <b>Product:</b> ${title || 'N/A'}
🆔 <b>ASIN:</b> ${asin}
💰 <b>Price:</b> ${current_price || 'N/A'}
👤 <b>Seller:</b> ${seller_name || 'N/A'}
👤 <b>My Account:</b> ${selected_account || 'N/A'}
        `.trim();

        // إرسال الصورة مع النص
        const url = `https://api.telegram.org/bot${this.config.bot_token}/sendPhoto`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.config.chat_id,
            photo: image_url,
            caption: photoMessage,
            parse_mode: 'HTML',
          }),
        });

        const result = await response.json();
        if (result.ok) {
          console.log('✅ Product image sent to Telegram');
        } else {
          console.error('❌ Failed to send product image:', result);
        }
      } catch (error) {
        console.error('❌ Error sending product image:', error);
      }
    }

    return textResult;
  }
}

module.exports = TelegramService; 