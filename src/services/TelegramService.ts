import { supabase } from '@/lib/supabaseClient';
import { CompetitorService } from './CompetitorService';

export interface TelegramConfig {
  bot_token: string;
  chat_id: string;
  is_enabled: boolean;
}

export interface BuyBoxAlert {
  asin: string;
  product_title: string;
  old_seller: string;
  new_seller: string;
  price: string;
  region: string;
  timestamp: string;
}

export class TelegramService {
  private static instance: TelegramService;
  private config: TelegramConfig | null = null;

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  // تحميل إعدادات التليجرام من قاعدة البيانات
  async loadConfig(): Promise<TelegramConfig | null> {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Telegram config:', error);
        return null;
      }

      this.config = data;
      return data;
    } catch (error) {
      console.error('Error loading Telegram config:', error);
      return null;
    }
  }

  // حفظ إعدادات التليجرام
  async saveConfig(config: TelegramConfig): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('telegram_config')
        .upsert([config], { onConflict: 'id' });

      if (error) throw error;

      this.config = config;
      return true;
    } catch (error) {
      console.error('Error saving Telegram config:', error);
      return false;
    }
  }

  // التحقق من أن البائع ليس من البائعين الخاصين بك
  async isMySeller(sellerName: string): Promise<boolean> {
    try {
      return await CompetitorService.isMySeller(sellerName);
    } catch (error) {
      console.error('Error checking if seller is mine:', error);
      return false;
    }
  }

  // إرسال رسالة تليجرام
  async sendMessage(message: string): Promise<boolean> {
    if (!this.config || !this.config.is_enabled || !this.config.bot_token || !this.config.chat_id) {
      console.log('Telegram notifications are disabled or not configured');
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
        console.error('Telegram API error:', result);
        return false;
      }

      console.log('✅ Telegram message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  // إرسال تنبيه خسارة Buy Box
  async sendBuyBoxLostAlert(alert: BuyBoxAlert): Promise<boolean> {
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

  // إرسال تنبيه استعادة Buy Box
  async sendBuyBoxWonAlert(alert: BuyBoxAlert): Promise<boolean> {
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

  // إرسال تنبيه تغير السعر
  async sendPriceChangeAlert(
    asin: string,
    productTitle: string,
    oldPrice: string,
    newPrice: string,
    priceChange: number,
    priceChangePercentage: number,
    region: string,
    sellerName: string
  ): Promise<boolean> {
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

  // اختبار إعدادات التليجرام
  async testConnection(): Promise<boolean> {
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
}

export const telegramService = TelegramService.getInstance(); 