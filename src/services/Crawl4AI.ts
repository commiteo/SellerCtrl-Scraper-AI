
interface CrawlData {
  url: string;
  title?: string;
  image?: string;
  price?: string;
  description?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class Crawl4AIService {
  static async scrape(url: string): Promise<{ success: boolean; data?: CrawlData; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Request failed' };
      }
      const json = await res.json();
      if (json.data) {
        return { success: true, data: { url, ...json.data } };
      }
      return { success: false, error: json.error || 'No data returned' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to crawl url',
      };
    }
  }
}
