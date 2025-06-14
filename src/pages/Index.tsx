
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
    <div className="min-h-full bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Product Data Extraction
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Enter an Amazon ASIN to extract detailed product information. 
            Select which data fields you want to retrieve.
          </p>
        </div>

        <ASINInput onScrape={handleScrape} isLoading={isLoading} />

        {productData && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-center text-white">
              Scraped Product Data
            </h3>
            <ProductResult product={productData} />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-400">Scraping product data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
