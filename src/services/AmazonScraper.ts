
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

export class AmazonScraper {
  private static API_KEY_STORAGE_KEY = 'crawl4ai_settings';

  static async scrapeProduct(
    asin: string,
    options: ScrapingOptions,
  ): Promise<{ success: boolean; data?: ProductData; error?: string }> {
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin, options }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Request failed' };
      }

      const json = await res.json();
      if (json.error) {
        return { success: false, error: json.error };
      }

      return { success: true, data: json.data as ProductData };
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
