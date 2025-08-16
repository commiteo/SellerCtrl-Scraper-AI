import { supabase } from '@/lib/supabaseClient';
import { AmazonScraper } from './AmazonScraper';

export interface MonitoredProduct {
  id: string;
  asin: string;
  title?: string;
  current_price?: number;
  previous_price?: number;
  price_change?: number;
  price_change_percentage?: number;
  last_scraped: string;
  next_scrape: string;
  is_active: boolean;
  region: string;
  scrape_interval: number;
  alert_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  asin: string;
  price: number;
  scraped_at: string;
  region: string;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  asin: string;
  old_price: number;
  new_price: number;
  price_change: number;
  price_change_percentage: number;
  alert_type: 'increase' | 'decrease' | 'threshold';
  is_read: boolean;
  created_at: string;
}

export interface AddProductRequest {
  asin: string;
  region: string;
  scrapeInterval: number;
  alertThreshold: number;
  isActive: boolean;
}

export class PriceMonitorService {
  // Get all monitored products
  static async getMonitoredProducts(): Promise<{ success: boolean; data?: MonitoredProduct[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('price_monitor_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching monitored products:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch monitored products' 
      };
    }
  }

  // Add a new product to monitoring
  static async addProduct(request: AddProductRequest): Promise<{ success: boolean; data?: MonitoredProduct; error?: string }> {
    try {
      const now = new Date();
      const nextScrape = new Date(now.getTime() + request.scrapeInterval * 60000);

      const { data, error } = await supabase
        .from('price_monitor_products')
        .insert([
          {
            asin: request.asin.toUpperCase(),
            region: request.region,
            scrape_interval: request.scrapeInterval,
            alert_threshold: request.alertThreshold,
            is_active: request.isActive,
            last_scraped: now.toISOString(),
            next_scrape: nextScrape.toISOString(),
            current_price: null,
            previous_price: null,
            price_change: null,
            price_change_percentage: null
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error adding product to monitoring:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add product to monitoring' 
      };
    }
  }

  // Update product monitoring status
  static async updateProductStatus(productId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('price_monitor_products')
        .update({ is_active: isActive })
        .eq('id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating product status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product status' 
      };
    }
  }

  // Delete a monitored product
  static async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('price_monitor_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete product' 
      };
    }
  }

  // Get products that need scraping
  static async getProductsDueForScraping(): Promise<{ success: boolean; data?: MonitoredProduct[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('price_monitor_products')
        .select('*')
        .eq('is_active', true)
        .lte('next_scrape', new Date().toISOString())
        .order('next_scrape', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching products due for scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products due for scraping' 
      };
    }
  }

  // Scrape and update product price
  static async scrapeAndUpdateProduct(product: MonitoredProduct): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`🔄 Scraping product: ${product.asin} (${product.region})`);

      // Scrape the product
      const scrapeResult = await AmazonScraper.scrapeProduct(
        product.asin,
        {
          includeTitle: true,
          includeImage: false,
          includePrice: true,
          includeBuyboxWinner: false,
          includeLink: false
        },
        product.region
      );

      if (!scrapeResult.success || !scrapeResult.data) {
        throw new Error(`Failed to scrape product ${product.asin}: ${scrapeResult.error}`);
      }

      const scrapedData = scrapeResult.data;
      const newPrice = scrapedData.price ? parseFloat(scrapedData.price.replace(/[^0-9.]/g, '')) : null;

      if (!newPrice) {
        throw new Error(`No valid price found for product ${product.asin}`);
      }

      // Update the product with new price
      const { data, error } = await supabase
        .from('price_monitor_products')
        .update({
          current_price: newPrice,
          title: scrapedData.title || product.title
        })
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Updated product ${product.asin}: $${newPrice}`);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ Error scraping product ${product.asin}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape product' 
      };
    }
  }

  // Run monitoring cycle for all due products
  static async runMonitoringCycle(): Promise<{ success: boolean; processed: number; errors: number; error?: string }> {
    try {
      console.log('🚀 Starting price monitoring cycle...');

      // Get products due for scraping
      const dueProductsResult = await this.getProductsDueForScraping();
      if (!dueProductsResult.success) {
        throw new Error(dueProductsResult.error);
      }

      const dueProducts = dueProductsResult.data || [];
      if (dueProducts.length === 0) {
        console.log('📭 No products due for scraping');
        return { success: true, processed: 0, errors: 0 };
      }

      console.log(`📋 Found ${dueProducts.length} products due for scraping`);

      let processed = 0;
      let errors = 0;

      // Process each product
      for (const product of dueProducts) {
        try {
          const result = await this.scrapeAndUpdateProduct(product);
          if (result.success) {
            processed++;
          } else {
            errors++;
            console.error(`Failed to process product ${product.asin}:`, result.error);
          }

          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          errors++;
          console.error(`Error processing product ${product.asin}:`, error);
        }
      }

      console.log(`✅ Monitoring cycle completed: ${processed} processed, ${errors} errors`);
      return { success: true, processed, errors };
    } catch (error) {
      console.error('❌ Error running monitoring cycle:', error);
      return { 
        success: false, 
        processed: 0, 
        errors: 0,
        error: error instanceof Error ? error.message : 'Failed to run monitoring cycle' 
      };
    }
  }

  // Get price history for a product
  static async getPriceHistory(productId: string, limit: number = 50): Promise<{ success: boolean; data?: PriceHistory[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', productId)
        .order('scraped_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching price history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch price history' 
      };
    }
  }

  // Get all price alerts
  static async getPriceAlerts(limit: number = 50): Promise<{ success: boolean; data?: PriceAlert[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch price alerts' 
      };
    }
  }

  // Mark alert as read
  static async markAlertAsRead(alertId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mark alert as read' 
      };
    }
  }

  // Get monitoring statistics
  static async getMonitoringStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data: products, error: productsError } = await supabase
        .from('price_monitor_products')
        .select('*');

      if (productsError) throw productsError;

      const { data: alerts, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('is_read', false);

      if (alertsError) throw alertsError;

      const stats = {
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.is_active).length || 0,
        dueForScraping: products?.filter(p => p.is_active && new Date(p.next_scrape) <= new Date()).length || 0,
        unreadAlerts: alerts?.length || 0,
        priceChanges: products?.filter(p => p.price_change !== null).length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching monitoring stats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch monitoring stats' 
      };
    }
  }

  // Validate ASIN format
  static validateASIN(asin: string): boolean {
    return asin.length === 10 && /^[A-Z0-9]{10}$/.test(asin);
  }

  // Start automatic monitoring (this would be called by a background service)
  static async startAutomaticMonitoring(): Promise<void> {
    console.log('🔄 Starting automatic price monitoring...');
    
    // Run initial cycle
    await this.runMonitoringCycle();
    
    // Set up interval for continuous monitoring
    setInterval(async () => {
      await this.runMonitoringCycle();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
} 