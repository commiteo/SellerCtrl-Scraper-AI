
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
    <div className="min-h-full bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-5.5c-.89 0-1.64.59-1.9 1.39l-.4 1.3c-.16.5.15 1.01.66 1.01h7.78c.51 0 .82-.51.66-1.01l-.4-1.3zM13 14h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm-1-6c-2.76 0-5 2.24-5 5 0 1.64.8 3.09 2.03 4h5.94c1.23-.91 2.03-2.36 2.03-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white">
            Amazon Product Scraper
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Extract detailed product information from Amazon using ASIN codes. 
            Get title, images, pricing, and seller data instantly.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <ASINInput onScrape={handleScrape} isLoading={isLoading} />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold mt-0.5">1</div>
                  <span>Enter a valid Amazon ASIN code</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold mt-0.5">2</div>
                  <span>Select the data fields you want</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold mt-0.5">3</div>
                  <span>Click scrape to get the data</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/50 via-blue-800/30 to-blue-900/50 rounded-xl p-6 border border-blue-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Available Data</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Product Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Product Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Current Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Buybox Winner</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Product Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {productData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Scraped Product Data
              </h2>
              <p className="text-gray-400">Successfully extracted product information</p>
            </div>
            <ProductResult product={productData} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Scraping Product Data</h3>
            <p className="text-gray-400">Please wait while we extract the product information...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
