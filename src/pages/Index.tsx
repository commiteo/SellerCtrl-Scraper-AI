
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
          newResults.push({ asin, loading: false, data: result.data });
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
      <div className="max-w-4xl mx-auto space-y-8">
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

        {results.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center text-[#FFFFFF] font-inter">
              Scraped Product Data
            </h3>
            {/* List each result */}
            <div className="flex flex-col gap-7 w-full max-w-3xl mx-auto">
              {results.map((result, i) =>
                result.loading ? (
                  <div key={result.asin} className="flex flex-col items-center justify-center py-10 w-full rounded-2xl border border-[#232323] bg-[#1C1C1C]/70">
                    <span className="font-mono text-[#A3A3A3] text-sm">Scraping ASIN: {result.asin}</span>
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7A00] mt-2" />
                  </div>
                ) : result.data ? (
                  <ProductResult key={result.asin} product={result.data} />
                ) : (
                  <div key={result.asin} className="flex flex-col items-center justify-center py-10 w-full rounded-2xl border border-[#462323] bg-[#251C1C]/60">
                    <span className="font-mono text-[#FF2F00] text-sm mb-2">ASIN: {result.asin}</span>
                    <div className="font-semibold text-lg text-[#FF2F00]">Failed to scrape: {result.error}</div>
                  </div>
                )
              )}
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
