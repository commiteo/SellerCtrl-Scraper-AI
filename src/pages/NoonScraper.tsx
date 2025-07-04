import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ProductResult } from '@/components/ProductResult';
import { NoonScraper } from '@/services/NoonScraper';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface NoonProductData {
  url: string;
  title?: string;
  image?: string;
  price?: string;
  seller?: string;
}

interface NoonScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeSeller: boolean;
  includeLink: boolean;
}

type ResultState = {
  url: string;
  loading: boolean;
  error?: string;
  data?: NoonProductData;
};

const NoonScraperPage = () => {
  const { toast } = useToast();
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<ResultState[]>([]);
  const [options, setOptions] = useState<NoonScrapingOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeSeller: true,
    includeLink: true,
  });
  const [input, setInput] = useState('');

  const handleScrape = async () => {
    setResults([]);
    setIsScraping(true);
    let urls = Array.from(new Set(input.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)));
    // Convert NSKU/ZSKU to Noon product URLs if not already a URL
    urls = urls.map(val => {
      if (/^https?:\/\//i.test(val)) return val;
      // Assume it's NSKU/ZSKU
      return `https://www.noon.com/egypt-en/${val}/p`;
    });
    setResults(urls.map(url => ({ url, loading: true })));
    const newResults: ResultState[] = [];
    for (const url of urls) {
      setResults(prev => prev.map(r => r.url === url ? { ...r, loading: true } : r));
      try {
        const result = await NoonScraper.scrapeProduct(url, options);
        if (result.success && result.data) {
          newResults.push({ url, loading: false, data: result.data });
        } else {
          newResults.push({ url, loading: false, error: result.error || "Failed to scrape" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to scrape';
        newResults.push({ url, loading: false, error: message });
      }
      setResults(current =>
        current.map(r =>
          r.url === url
            ? newResults.find(nr => nr.url === url) || r
            : r
        )
      );
    }
    setIsScraping(false);
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-[#FFFFFF] font-inter">
            Product Data Extraction (Noon)
          </h2>
          <p className="text-lg text-[#E0E0E0]/80 max-w-2xl mx-auto">
            Enter one or multiple Noon product codes to extract detailed product information. Select which data fields you want to retrieve.
          </p>
        </div>
        <Card className="w-full max-w-6xl mx-auto dashboard-card font-inter px-8">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="flex items-center gap-2 text-2xl text-[#FFFFFF] font-inter">
              {/* Noon icon: yellow circle with black n */}
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#FFD600]">
                <span className="text-black text-lg font-bold" style={{fontFamily: 'monospace'}}>n</span>
              </span>
              Noon Product Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={e => { e.preventDefault(); handleScrape(); }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="noon-codes" className="text-base font-medium text-[#FFFFFF] font-inter">
                  Noon Product Codes
                </Label>
                <div className="relative">
                  <textarea
                    id="noon-codes"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={3}
                    className="pl-10 text-lg bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] placeholder-[#A3A3A3] focus:border-[#FFD600] font-inter rounded w-full resize-y min-h-[48px] max-h-[150px]"
                    placeholder="e.g., N70106183V, N52230404A or one code per line"
                    required
                  />
                  {/* Search icon for visual match */}
                  <svg className="absolute left-3 top-3 h-4 w-4 text-[#A3A3A3] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                <p className="text-sm text-[#A3A3A3]">
                  Enter one or more Noon product codes, separated by commas, spaces, or new lines.
                </p>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-medium text-[#FFFFFF] font-inter">Select data to extract:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="title" checked={options.includeTitle} onCheckedChange={checked => setOptions(o => ({ ...o, includeTitle: checked as boolean }))} />
                    <Label htmlFor="title" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Title</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="image" checked={options.includeImage} onCheckedChange={checked => setOptions(o => ({ ...o, includeImage: checked as boolean }))} />
                    <Label htmlFor="image" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="price" checked={options.includePrice} onCheckedChange={checked => setOptions(o => ({ ...o, includePrice: checked as boolean }))} />
                    <Label htmlFor="price" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="seller" checked={options.includeSeller} onCheckedChange={checked => setOptions(o => ({ ...o, includeSeller: checked as boolean }))} />
                    <Label htmlFor="seller" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Checkbox id="link" checked={options.includeLink} onCheckedChange={checked => setOptions(o => ({ ...o, includeLink: checked as boolean }))} />
                    <Label htmlFor="link" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Link</Label>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isScraping || !input.trim()}
                className="w-full btn-glow py-3 text-lg border-0 font-inter bg-[#FFD600] text-black hover:bg-[#ffe066]"
              >
                {isScraping ? "Scraping..." : "Scrape Product Data"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading message */}
        {isScraping && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7A00]" />
            <p className="mt-2 text-[#FF7A00] font-bold">Fetching data from Noon... Please wait</p>
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
            <p className="text-red-500 font-bold">Failed to scrape: {results.find(r => r.error)?.error}</p>
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
                    {options.includeSeller && <th className="px-4 py-2 text-[#E0E0E0]">Seller</th>}
                    {options.includeLink && <th className="px-4 py-2 text-[#E0E0E0]">Product Link</th>}
                    <th className="px-4 py-2 text-[#E0E0E0]">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, i) =>
                    result.loading ? null :
                    result.data ? (
                      <tr key={result.url} className="bg-[#232323] hover:bg-[#181818] rounded-lg">
                        {options.includeImage && <td className="px-4 py-2"><img src={result.data.image} alt="Product" className="w-16 h-16 object-contain rounded border border-[#2A2A2A] bg-[#181818]" /></td>}
                        {options.includeTitle && <td className="px-4 py-2 text-[#FAFAFA] max-w-xs truncate">{result.data.title}</td>}
                        {options.includePrice && <td className="px-4 py-2 text-[#FF7A00] font-bold">{result.data.price}</td>}
                        {options.includeSeller && <td className="px-4 py-2 text-[#E0E0E0]">{result.data.seller}</td>}
                        {options.includeLink && <td className="px-4 py-2"><a href={result.data.url} target="_blank" rel="noopener noreferrer" className="text-[#FF7A00] underline">Link</a></td>}
                        <td className="px-4 py-2 font-mono text-[#FF7A00]">{result.url.match(/([A-Z0-9]{10,})/)?.[1] || result.url}</td>
                      </tr>
                    ) : (
                      <tr key={result.url}>
                        <td colSpan={6} className="text-center py-8 text-[#FF2F00]">Failed to scrape: {result.error}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoonScraperPage; 