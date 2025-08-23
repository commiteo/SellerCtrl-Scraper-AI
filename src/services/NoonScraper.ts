import { supabase } from '@/lib/supabaseClient';
import { API_CONFIG } from '../lib/api';

interface ProductData {
  productCode: string;
  title?: string;
  image?: string;
  price?: string;
  seller?: string;
  link?: string;
  dataSource?: string;
}

interface ScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeSeller: boolean;
  includeLink: boolean;
}

export class NoonScraper {

  static async scrapeProduct(
    productCode: string,
    options: ScrapingOptions
  ): Promise<{ success: boolean; data?: ProductData; error?: string }> {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/noon-scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode, options }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Request failed' };
      }
      const json = await res.json();
      if (json.data) {
        // Save to noon_scraping_history
        const { error } = await supabase.from('noon_scraping_history').insert([
          {
            product_code: productCode,
            title: json.data.title,
            price: json.data.price,
            seller: json.data.seller,
            image: json.data.image,
            url: json.data.url,
            scraped_at: new Date().toISOString(),
            // user_id: أضف هنا user_id إذا كان متوفراً من السياق
          }
        ]);
        if (error) {
          console.error('Supabase insert error (Noon):', error.message, error.details);
          // يمكنك هنا استخدام Toast إذا كان متاحًا في السياق
        }
        // --- Sync competitors automatically ---
        try {
          await fetch(`${API_CONFIG.BASE_URL}/api/sync-competitors`, { method: 'POST' });
        } catch (e) {
          console.error('Failed to sync competitors:', e);
        }
        return { success: true, data: { ...json.data, productCode } };
      }
      return { success: false, error: json.error || 'No data returned' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape Noon product data',
      };
    }
  }
} 