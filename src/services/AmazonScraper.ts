import { supabase } from '@/lib/supabaseClient';

interface ProductData {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  buyboxWinner?: string;
  link?: string;
  dataSource?: string; // إضافة مصدر البيانات
}

interface ScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeBuyboxWinner: boolean;
  includeLink: boolean;
}

import { API_CONFIG, apiCall } from '../lib/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class AmazonScraper {

  static async scrapeProduct(
    asin: string,
    options: ScrapingOptions,
    region: string // new parameter
  ): Promise<{ success: boolean; data?: ProductData; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin, options, region }), // send region
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Request failed' };
      }

      const json = await res.json();
      // Debug: print the full data object received from backend
      console.log('Received from backend:', json.data);
      if (json.data) {
        // Debug: print all fields before saving
        console.log('Saving to DB:', {
          asin: json.data.asin,
          title: json.data.title,
          price: json.data.price,
          current_seller: json.data.buyboxWinner || json.data.seller,
          image: json.data.image,
          link: json.data.link,
          data_source: json.data.dataSource, // إضافة مصدر البيانات
          scraped_at: new Date().toISOString(),
        });
        // Save to amazon_scraping_history
        const { error } = await supabase.from('amazon_scraping_history').upsert([
          {
            asin: json.data.asin,
            title: json.data.title,
            price: json.data.price,
            current_seller: json.data.buyboxWinner || json.data.seller,
            image: json.data.image,
            link: json.data.link,
            data_source: json.data.dataSource, // إضافة مصدر البيانات
            scraped_at: new Date().toISOString(),
            // user_id: أضف هنا user_id إذا كان متوفراً من السياق
          }
        ], { onConflict: 'asin' });
        if (error) {
          console.error('Supabase insert error (Amazon):', error.message, error.details);
          // يمكنك هنا استخدام Toast إذا كان متاحًا في السياق
        }
        // --- Sync competitors automatically ---
        try {
          await fetch(`${API_BASE_URL}/api/sync-competitors`, { method: 'POST' });
        } catch (e) {
          console.error('Failed to sync competitors:', e);
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
