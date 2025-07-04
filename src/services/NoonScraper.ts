import { supabase } from '@/lib/supabaseClient';

interface NoonProductData {
  url: string;
  title?: string;
  image?: string;
  price?: string;
  seller?: string;
}

interface NoonScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeSeller: boolean;
  includeLink: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class NoonScraper {
  static async scrapeProduct(
    url: string,
    options: NoonScrapingOptions
  ): Promise<{ success: boolean; data?: NoonProductData; error?: string }> {
    try {
      // Extract product code from URL
      let productCode = url;
      const match = url.match(/noon\.com\/.*\/(.*?)\/p/);
      if (match) {
        productCode = match[1];
      }

      const res = await fetch(`${API_BASE_URL}/api/noon-scrape`, {
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
            scraped_at: new Date().toISOString(),
            // user_id: أضف هنا user_id إذا كان متوفر من السياق
          }
        ]);
        if (error) {
          console.error('Supabase insert error (Noon):', error.message, error.details);
          // يمكنك هنا استخدام Toast إذا كان متاحًا في السياق
        }
        return { success: true, data: { ...json.data, url } };
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