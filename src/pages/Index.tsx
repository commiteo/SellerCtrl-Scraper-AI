import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ASINInput } from '@/components/ASINInput';
import { ProductResult } from '@/components/ProductResult';
import { AmazonScraper } from '@/services/AmazonScraper';
import { supabase } from '@/lib/supabaseClient';

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

type ResultState = {
  asin: string;
  loading: boolean;
  error?: string;
  data?: ProductData;
};

const Index = () => {
  const { toast } = useToast();
  const [isScraping, setIsScraping] = useState(false);
  // State: for each ASIN, track its scrape status (loading/data/error)
  const [results, setResults] = useState<ResultState[]>([]);
  const [options, setOptions] = useState<ScrapingOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeBuyboxWinner: true,
    includeLink: true,
  });

  // Accepts an array of ASINs
  const handleScrape = async (asins: string[], options: ScrapingOptions) => {
    // Remove results and re-initiate
    setResults([]);
    setIsScraping(true);

    // Validate input
    const validAsins = asins.filter(AmazonScraper.validateASIN);
    const invalidAsins = asins.filter(asin => !AmazonScraper.validateASIN(asin));
    if (invalidAsins.length) {
      toast({
        title: "Invalid ASIN(s)",
        description: `Invalid ASINs: ${invalidAsins.join(", ")}`,
        variant: "destructive",
        duration: 4000,
      });
      if (validAsins.length === 0) {
        setIsScraping(false);
        return;
      }
    }

    // Set loading state for all valid ASINs
    setResults(validAsins.map(a => ({ asin: a, loading: true })));

    // Scrape serially for better rate limit handling, but could be changed to parallel if backend allows
    const newResults: ResultState[] = [];
    for (const asin of validAsins) {
      setResults(prev => prev.map(r => r.asin === asin ? { ...r, loading: true } : r));
      try {
        const result = await AmazonScraper.scrapeProduct(asin, options);
        if (result.success && result.data) {
          const priceValue = result.data.price
            ? Number(String(result.data.price).replace(/[^0-9.]/g, ''))
            : null;
          newResults.push({ asin, loading: false, data: result.data });
          // Save only to amazon_scraping_history
          console.log('Inserting Amazon data:', result.data);
          const { error, data } = await supabase.from('amazon_scraping_history').insert([
            {
              asin: result.data.asin,
              title: result.data.title,
              price: priceValue,
              current_seller: result.data.buyboxWinner,
              scraped_at: new Date().toISOString(),
              // user_id: أضف هنا user_id إذا كان متوفر من السياق
            }
          ]);
          console.log('Insert result:', { error, data });
        } else {
          newResults.push({ asin, loading: false, error: result.error || "Failed to scrape" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to scrape';
        newResults.push({ asin, loading: false, error: message });
      }
      setResults(current =>
        current.map(r =>
          r.asin === asin
            ? newResults.find(nr => nr.asin === asin) || r
            : r
        )
      );
    }

    // Show toast for the batch result summary
    const failed = newResults.filter(r => r.error);
    if (failed.length && failed.length !== validAsins.length) {
      toast({
        title: "Some products failed",
        description: `${failed.length} out of ${validAsins.length} ASINs failed.`,
        variant: "destructive",
      });
    } else if (failed.length === validAsins.length) {
      toast({
        title: "Failed",
        description: "All product data scrapes failed.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${validAsins.length - failed.length}/${validAsins.length} products scraped successfully.`,
        duration: 3000,
      });
    }

    setIsScraping(false);
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-[#FFFFFF] font-inter">
            Product Data Extraction
          </h2>
          <p className="text-lg text-[#E0E0E0]/80 max-w-2xl mx-auto">
            Enter one or multiple Amazon ASINs to extract detailed product information. 
            Select which data fields you want to retrieve.
          </p>
        </div>

        <ASINInput onScrape={handleScrape} isLoading={isScraping} />

        {/* Loading message */}
        {isScraping && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7A00]" />
            <p className="mt-2 text-[#FF7A00] font-bold">Fetching data from Amazon... Please wait</p>
          </div>
        )}

        {/* Success/Error messages */}
        {!isScraping && results.length > 0 && results.every(r => r.data) && (
          <div className="text-center py-2">
            <p className="text-green-500 font-bold">Product data fetched successfully!</p>
          </div>
        )}
        {!isScraping && results.some(r => r.error) && (
          <div className="text-center py-2">
            <p className="text-red-500 font-bold">حدث خطأ أثناء السحب: {results.find(r => r.error)?.error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center text-[#FFFFFF] font-inter">
              Scraped Product Data
            </h3>
            <div className="w-full max-w-6xl mx-auto overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-[#181818]">
                    {options.includeImage && <th className="px-4 py-2 text-[#E0E0E0]">Image</th>}
                    {options.includeTitle && <th className="px-4 py-2 text-[#E0E0E0]">Title</th>}
                    {options.includePrice && <th className="px-4 py-2 text-[#E0E0E0]">Price</th>}
                    {options.includeBuyboxWinner && <th className="px-4 py-2 text-[#E0E0E0]">Buybox Winner</th>}
                    {options.includeLink && <th className="px-4 py-2 text-[#E0E0E0]">Product Link</th>}
                    <th className="px-4 py-2 text-[#E0E0E0]">ASIN</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, i) =>
                    result.loading ? null : // Hide loading row
                    result.data ? (
                      <tr key={result.asin} className="bg-[#232323] hover:bg-[#181818] rounded-lg">
                        {options.includeImage && <td className="px-4 py-2"><img src={result.data.image} alt="Product" className="w-16 h-16 object-contain rounded border border-[#2A2A2A] bg-[#181818]" /></td>}
                        {options.includeTitle && <td className="px-4 py-2 text-[#FAFAFA] max-w-xs truncate">{result.data.title}</td>}
                        {options.includePrice && <td className="px-4 py-2 text-[#FF7A00] font-bold">{result.data.price}</td>}
                        {options.includeBuyboxWinner && <td className="px-4 py-2 text-[#E0E0E0]">{result.data.buyboxWinner}</td>}
                        {options.includeLink && <td className="px-4 py-2"><a href={result.data.link} target="_blank" rel="noopener noreferrer" className="text-[#FF7A00] underline">Link</a></td>}
                        <td className="px-4 py-2 font-mono text-[#FF7A00]">{result.data.asin}</td>
                      </tr>
                    ) : (
                      <tr key={result.asin}>
                        <td colSpan={6} className="text-center py-8 text-[#FF2F00]">Failed to scrape: {result.error}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isScraping && results.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7A00]" />
            <p className="mt-4 text-[#E0E0E0]/80">Scraping product data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
