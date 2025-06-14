
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ASINInput } from '@/components/ASINInput';
import { ProductResult } from '@/components/ProductResult';
import { AmazonScraper } from '@/services/AmazonScraper';

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

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const handleScrape = async (asin: string, options: ScrapingOptions) => {
    if (!AmazonScraper.validateASIN(asin)) {
      toast({
        title: "Invalid ASIN",
        description: "Please enter a valid 10-character Amazon ASIN",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setProductData(null);
    
    try {
      console.log('Starting scrape for ASIN:', asin);
      const result = await AmazonScraper.scrapeProduct(asin, options);
      
      if (result.success && result.data) {
        setProductData(result.data);
        toast({
          title: "Success",
          description: "Product data scraped successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to scrape product data",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error scraping product:', error);
      toast({
        title: "Error",
        description: "Failed to scrape product data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Amazon Product Scraper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract detailed product information from Amazon using ASIN. 
            Powered by Crawl4AI for accurate and efficient data scraping.
          </p>
        </div>

        <ASINInput onScrape={handleScrape} isLoading={isLoading} />

        {productData && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Scraped Product Data
            </h2>
            <ProductResult product={productData} />
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Scraping product data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
