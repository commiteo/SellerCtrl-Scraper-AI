import { supabase } from '@/lib/supabaseClient';

interface ProductData {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  buyboxWinner?: string;
  link?: string;
}

interface ScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeBuyboxWinner: boolean;
  includeLink: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class AmazonScraper {

  static async scrapeProduct(
    asin: string,
    options: ScrapingOptions,
  ): Promise<{ success: boolean; data?: ProductData; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin, options }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Request failed' };
      }

      const json = await res.json();
      if (json.data) {
        // Save to amazon_scraping_history
        const { error } = await supabase.from('amazon_scraping_history').insert([
          {
            asin: json.data.asin,
            title: json.data.title,
            price: json.data.price,
            current_seller: json.data.buyboxWinner || json.data.seller,
            scraped_at: new Date().toISOString(),
            // user_id: أضف هنا user_id إذا كان متوفر من السياق
          }
        ]);
        if (error) {
          console.error('Supabase insert error (Amazon):', error.message, error.details);
          // يمكنك هنا استخدام Toast إذا كان متاحًا في السياق
        }
        return { success: true, data: { ...json.data, asin } };
      }
      return { success: false, error: json.error || 'No data returned' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape product data',
      };
    }
  }

  static validateASIN(asin: string): boolean {
    // Amazon ASINs are typically 10 characters long and alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/i;
    return asinRegex.test(asin.trim());
  }
}
