import { supabase } from '@/lib/supabaseClient';

export interface MultiDomainProductData {
  asin: string;
  title?: string;
  price?: number;
  currency?: string;
  domain: string;
  seller?: string;
  imageUrl?: string;
  productUrl?: string;
  dataSource?: string;
  status: 'success' | 'failed' | 'unavailable';
  errorMessage?: string;
}

export interface MultiDomainResult {
  asin: string;
  title?: string;
  results: MultiDomainProductData[];
  bestPrice?: number;
  bestDomain?: string;
  bestCurrency?: string;
  priceDifference?: number;
}

export interface MultiDomainOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeSeller: boolean;
  includeLink: boolean;
  comparePrices: boolean;
  findBestDeals: boolean;
}

import { API_CONFIG } from '../lib/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class MultiDomainScraper {
  static readonly SUPPORTED_DOMAINS = [
    { code: 'eg', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
    { code: 'sa', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
    { code: 'ae', name: 'UAE', currency: 'AED', flag: '🇦🇪' },
    { code: 'com', name: 'USA', currency: 'USD', flag: '🇺🇸' },
    { code: 'de', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'uk', name: 'UK', currency: 'GBP', flag: '🇬🇧' }
  ];

  static validateASIN(asin: string): boolean {
    return /^[A-Z0-9]{10}$/.test(asin);
  }

  static async scrapeMultiDomain(
    asins: string[],
    domains: string[],
    options: MultiDomainOptions,
    onProgressUpdate?: (result: MultiDomainResult, currentIndex: number, total: number) => void
  ): Promise<{ success: boolean; results?: MultiDomainResult[]; error?: string }> {
    try {
      console.log('🚀 Starting multi-domain scraping:', { asins, domains });
      
      const results: MultiDomainResult[] = [];
      let totalSaved = 0;
      let totalErrors = 0;

      // Process each ASIN
      for (let asinIndex = 0; asinIndex < asins.length; asinIndex++) {
        const asin = asins[asinIndex];
        console.log(`📦 Processing ASIN: ${asin} (${asinIndex + 1}/${asins.length})`);
        
        const asinResults: MultiDomainProductData[] = [];

        // 🚀 Use parallel crew scraping for all domains at once
        try {
          console.log(`🚀 Starting parallel crew scraping for ${asin} across ${domains.length} domains...`);
          const parallelResults = await this.scrapeDomainsParallel(asin, domains, options);
          asinResults.push(...parallelResults);
          
          const successCount = parallelResults.filter(r => r.status === 'success').length;
          const failCount = parallelResults.filter(r => r.status === 'failed').length;
          console.log(`✅ Parallel crew scraping completed for ${asin}: ${successCount} success, ${failCount} failed`);
          
          totalErrors += failCount;
        } catch (error) {
          console.error(`💥 Parallel crew scraping failed for ${asin}, falling back to sequential:`, error);
          
          // Fallback to sequential scraping
          for (const domain of domains) {
            try {
              console.log(`🌐 Fallback: Scraping ${asin} from ${domain}...`);
              const result = await this.scrapeSingleDomain(asin, domain, options);
              asinResults.push(result);
              console.log(`✅ Fallback: Successfully scraped ${asin} from ${domain}:`, result.status);
            } catch (domainError) {
              console.error(`❌ Fallback: Failed to scrape ${asin} from ${domain}:`, domainError);
              asinResults.push({
                asin,
                domain,
                status: 'failed',
                errorMessage: domainError instanceof Error ? domainError.message : 'Unknown error'
              });
              totalErrors++;
            }
          }
        }

        // Create result object for this ASIN
        const asinResult: MultiDomainResult = {
          asin,
          title: asinResults.find(r => r.title)?.title,
          results: asinResults
        };

        // Calculate best price if comparison is enabled
        if (options.comparePrices) {
          const priceAnalysis = this.analyzePrices(asinResults);
          asinResult.bestPrice = priceAnalysis.bestPrice;
          asinResult.bestDomain = priceAnalysis.bestDomain;
          asinResult.bestCurrency = priceAnalysis.bestCurrency;
          asinResult.priceDifference = priceAnalysis.priceDifference;
        }

        results.push(asinResult);

        // 🔥 إرسال النتيجة فور الانتهاء من ASIN
        if (onProgressUpdate) {
          onProgressUpdate(asinResult, asinIndex + 1, asins.length);
        }

        // Save to database
        try {
          console.log(`💾 Attempting to save ${asinResults.length} results for ASIN ${asin}...`);
          console.log(`📊 Results to save:`, asinResults.map(r => ({
            asin: r.asin,
            domain: r.domain,
            status: r.status,
            price: r.price,
            title: r.title?.substring(0, 50) + '...'
          })));
          
          await this.saveMultiDomainResults(asinResults);
          totalSaved += asinResults.length;
          console.log(`✅ Successfully saved ${asinResults.length} results for ASIN ${asin}`);
        } catch (saveError) {
          console.error(`💥 Failed to save results for ASIN ${asin}:`, saveError);
          totalErrors++;
        }
      }

      console.log(`🎉 Multi-domain scraping completed!`, {
        totalAsins: asins.length,
        totalDomains: domains.length,
        totalResults: results.length,
        totalSaved,
        totalErrors
      });

      return { success: true, results };
    } catch (error) {
      console.error('💥 Multi-domain scraping failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Multi-domain scraping failed'
      };
    }
  }

  private static async scrapeSingleDomain(
    asin: string,
    domain: string,
    options: MultiDomainOptions
  ): Promise<MultiDomainProductData> {
    try {
      console.log(`🌐 Starting scrape for ASIN ${asin} from domain ${domain}`);
      console.log(`🔗 API_BASE_URL: ${API_BASE_URL}`);
      
      const requestBody = { asin, domain, options };
      console.log(`📤 Request body:`, requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/parallel-multi-domain-scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📡 Raw response for ${asin} from ${domain}:`, data);
      
      if (data.success && data.data) {
        const result: MultiDomainProductData = {
          asin,
          title: data.data.title,
          price: data.data.price,
          currency: data.data.currency,
          domain,
          seller: data.data.seller,
          imageUrl: data.data.imageUrl,
          productUrl: data.data.productUrl,
          dataSource: data.data.dataSource,
          status: (data.data.status || 'success') as 'success' | 'failed' | 'unavailable'
        };
        console.log(`✅ Success result for ${asin} from ${domain}:`, result);
        return result;
      } else if (data.data) {
        // Handle case where data exists but success is not set
        const result: MultiDomainProductData = {
          asin,
          title: data.data.title,
          price: data.data.price,
          currency: data.data.currency,
          domain,
          seller: data.data.seller,
          imageUrl: data.data.imageUrl,
          productUrl: data.data.productUrl,
          dataSource: data.data.dataSource,
          status: (data.data.status || 'success') as 'success' | 'failed' | 'unavailable'
        };
        console.log(`⚠️ Data result for ${asin} from ${domain}:`, result);
        return result;
      } else {
        const result: MultiDomainProductData = {
          asin,
          domain,
          status: 'failed',
          errorMessage: data.error || 'No data returned'
        };
        console.log(`❌ Failed result for ${asin} from ${domain}:`, result);
        return result;
      }
    } catch (error) {
      console.error(`💥 Network error for ${asin} from ${domain}:`, error);
      const result: MultiDomainProductData = {
        asin,
        domain,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Request failed'
      };
      console.log(`💥 Error result for ${asin} from ${domain}:`, result);
      return result;
    }
  }

  // 🚀 New parallel scraping method using crew
  private static async scrapeDomainsParallel(
    asin: string,
    domains: string[],
    options: MultiDomainOptions
  ): Promise<MultiDomainProductData[]> {
    try {
      console.log(`🚀 Starting parallel crew scraping for ASIN ${asin} across domains: ${domains.join(', ')}`);
      
      const response = await fetch(`${API_BASE_URL}/api/crew-parallel-scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin, domains, options })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Crew parallel scraping HTTP Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📡 Crew parallel scraping response:`, data);
      
      if (data.success && data.results) {
        const results: MultiDomainProductData[] = data.results.map((result: any) => ({
          asin: result.asin || asin,
          title: result.title,
          price: result.price,
          currency: result.currency,
          domain: result.domain,
          seller: result.seller,
          imageUrl: result.imageUrl,
          productUrl: result.productUrl,
          dataSource: result.dataSource,
          status: (result.status || 'success') as 'success' | 'failed' | 'unavailable',
          scrapingTime: result.scrapingTime
        }));
        
        console.log(`✅ Crew parallel scraping successful - ${results.length} results in ${data.totalTime}ms`);
        return results;
      } else {
        throw new Error(data.error || 'Crew parallel scraping failed');
      }
    } catch (error) {
      console.error(`💥 Crew parallel scraping error:`, error);
      
      // Fallback to sequential scraping
      console.log(`🔄 Falling back to sequential scraping...`);
      const results: MultiDomainProductData[] = [];
      
      for (const domain of domains) {
        try {
          const result = await this.scrapeSingleDomain(asin, domain, options);
          results.push(result);
        } catch (domainError) {
          console.error(`❌ Fallback scraping failed for ${domain}:`, domainError);
          results.push({
            asin,
            domain,
            status: 'failed',
            errorMessage: domainError instanceof Error ? domainError.message : 'Fallback scraping failed'
          });
        }
      }
      
      return results;
    }
  }

  private static analyzePrices(results: MultiDomainProductData[]) {
    const validPrices = results
      .filter(r => r.status === 'success' && r.price && r.price > 0)
      .sort((a, b) => (a.price || 0) - (b.price || 0));

    if (validPrices.length === 0) {
      return { bestPrice: undefined, bestDomain: undefined, bestCurrency: undefined, priceDifference: undefined };
    }

    const best = validPrices[0];
    const worst = validPrices[validPrices.length - 1];
    const priceDifference = worst.price && best.price 
      ? ((worst.price - best.price) / worst.price) * 100 
      : undefined;

    return {
      bestPrice: best.price,
      bestDomain: best.domain,
      bestCurrency: best.currency,
      priceDifference
    };
  }

  private static async saveMultiDomainResults(
    results: MultiDomainProductData[]
  ): Promise<void> {
    try {
      console.log('🔄 Attempting to save multi-domain results:', { 
        count: results.length,
        results: results.map(r => ({ asin: r.asin, domain: r.domain, status: r.status, price: r.price }))
      });

      // تجميع البيانات حسب ASIN
      const asinGroups = new Map<string, any>();
      
      results.forEach(result => {
        console.log(`📝 Processing result for ASIN ${result.asin}, domain ${result.domain}:`, {
          status: result.status,
          price: result.price,
          title: result.title?.substring(0, 50)
        });

        if (!asinGroups.has(result.asin)) {
          asinGroups.set(result.asin, {
            asin: result.asin,
            title: result.title || null,
            image_url: result.imageUrl || null,
            price_eg: null,
            price_sa: null,
            price_ae: null,
            price_us: null,
            price_de: null
          });
        }
        
        const group = asinGroups.get(result.asin);
        const price = result.status === 'success' ? result.price : null;
        
        console.log(`💰 Setting price for ${result.domain}: ${price}`);
        
        // إضافة السعر للدومين المناسب
        switch (result.domain) {
          case 'eg':
            group.price_eg = price;
            break;
          case 'sa':
            group.price_sa = price;
            break;
          case 'ae':
            group.price_ae = price;
            break;
          case 'com':
            group.price_us = price;
            break;
          case 'de':
            group.price_de = price;
            break;
        }
      });

      const dataToInsert = Array.from(asinGroups.values());
      console.log('📊 Final data to insert:', JSON.stringify(dataToInsert, null, 2));

      // استخدام upsert بدلاً من حذف ثم إدراج
      const { data, error } = await supabase
        .from('multi_domain_products')
        .upsert(dataToInsert, { 
          onConflict: 'asin',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('❌ Error saving multi-domain results:', error);
        throw error;
      }

      console.log('✅ Successfully saved multi-domain results:', { 
        savedCount: data?.length || 0,
        savedData: data
      });
    } catch (error) {
      console.error('💥 Failed to save multi-domain results:', error);
      throw error;
    }
  }

  static async getMultiDomainHistory(limit = 50): Promise<MultiDomainProductData[]> {
    try {
      const { data, error } = await supabase
        .from('multi_domain_scraping_history')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(item => ({
        asin: item.asin,
        title: item.title,
        price: item.price,
        currency: item.currency,
        domain: item.domain,
        seller: item.seller,
        imageUrl: item.image_url,
        productUrl: item.product_url,
        dataSource: item.data_source,
        status: item.status,
        errorMessage: item.error_message
      }));
    } catch (error) {
      console.error('Failed to get multi-domain history:', error);
      return [];
    }
  }

  // Test complete scraping and saving process
  static async testCompleteProcess(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing complete scraping and saving process...');
      
      // Test scraping one ASIN from one domain
      const testAsin = 'B01MUBUOYC';
      const testDomain = 'com';
      const testOptions = {
        includeTitle: true,
        includeImage: true,
        includePrice: true,
        includeSeller: true,
        includeLink: true,
        comparePrices: true,
        findBestDeals: true
      };

      console.log('🌐 Testing scraping...');
      const result = await this.scrapeSingleDomain(testAsin, testDomain, testOptions);
      console.log('📊 Scraping result:', result);

      if (result.status === 'success') {
        console.log('💾 Testing saving...');
        await this.saveMultiDomainResults([result]);
        console.log('✅ Complete process test successful!');
        return { success: true };
      } else {
        console.log('❌ Scraping failed:', result.errorMessage);
        return { success: false, error: result.errorMessage };
      }
    } catch (error) {
      console.error('💥 Complete process test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test backend connection
  static async testBackendConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing backend connection...');
      
      const response = await fetch(`${API_BASE_URL}/api/multi-domain-scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          asin: 'B01MUBUOYC', 
          domain: 'com', 
          options: {} 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend connection test failed:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      console.log('✅ Backend connection test successful:', data);
      return { success: true };
    } catch (error) {
      console.error('💥 Backend connection test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test database connection
  static async testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await supabase
        .from('multi_domain_products')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Database connection test successful');
      return { success: true };
    } catch (error) {
      console.error('💥 Database connection test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test insert a simple record
  static async testDatabaseInsert(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing database insert...');
      
      const testData = {
        asin: 'TEST12345',
        title: 'Test Product',
        image_url: 'https://example.com/test.jpg',
        price_eg: 100.00,
        price_sa: 200.00,
        price_ae: 300.00,
        price_us: 50.00,
        price_de: 45.00
      };

      const { data, error } = await supabase
        .from('multi_domain_products')
        .insert([testData])
        .select();

      if (error) {
        console.error('❌ Database insert test failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Database insert test successful:', data);
      return { success: true };
    } catch (error) {
      console.error('💥 Database insert test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test insert real data to multi_domain_products
  static async testRealDataInsert(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing real data insert to multi_domain_products...');
      
      const testData = {
        asin: 'B01MUBUOYC',
        title: 'AquaBliss High Output 15-Stage Shower Filter',
        image_url: 'https://example.com/image.jpg',
        price_eg: 4001.05,
        price_sa: 190.00,
        price_ae: 304.00,
        price_us: 35.99,
        price_de: null
      };

      const { data, error } = await supabase
        .from('multi_domain_products')
        .insert([testData])
        .select();

      if (error) {
        console.error('❌ Real data insert test failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Real data insert test successful:', data);
      return { success: true };
    } catch (error) {
      console.error('💥 Real data insert test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 