
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
    _options: ScrapingOptions,
  ): Promise<{ success: boolean; data?: ProductData; error?: string }> {
    try {
      const start = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin }),
      });

      if (!start.ok) {
        const text = await start.text();
        return { success: false, error: text || 'Request failed' };
      }

      const startJson = await start.json();
      if (!startJson.jobId) {
        return { success: false, error: startJson.error || 'Failed to queue job' };
      }

      const jobId = startJson.jobId as string;

      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`/job-status/${jobId}`);
        if (!statusRes.ok) continue;
        const status = await statusRes.json();
        if (status.state === 'completed') {
          return { success: true, data: status.result as ProductData };
        }
        if (status.state === 'failed') {
          return { success: false, error: 'Scrape failed' };
        }
      }

      return { success: false, error: 'Timed out waiting for result' };
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
