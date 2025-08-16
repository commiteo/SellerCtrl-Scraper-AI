import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ASINInput } from '@/components/ASINInput';
import { ProductResult } from '@/components/ProductResult';
import { AmazonScraper } from '@/services/AmazonScraper';
import { supabase } from '@/lib/supabaseClient';
import { Download, Square, Play, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useSoundSettings } from '@/contexts/SoundContext';
import { exportToCSV, formatDataForExport, formatAmazonScraperData } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductData {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  buyboxWinner?: string;
  link?: string;
  dataSource?: string;
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
  const { playSuccess, playError } = useSoundSettings();
  const [isScraping, setIsScraping] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ResultState[]>([]);
  const [options, setOptions] = useState<ScrapingOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeBuyboxWinner: true,
    includeLink: true,
  });
  const [region, setRegion] = useState('eg');
  const [showOptions, setShowOptions] = useState(false);

  // دالة إيقاف السكرابينج
  const handleStopScraping = () => {
    setShouldStop(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScraping(false);
    toast({
      title: "Scraping Stopped",
      description: "The scraping process has been stopped.",
      variant: "destructive",
    });
  };

  // Accepts an array of ASINs and region
  const handleScrape = async (asins: string[], options: ScrapingOptions, region: string) => {
    // إعادة تعيين حالة الإيقاف
    setShouldStop(false);
    abortControllerRef.current = new AbortController();
    
    // Remove results and re-initiate
    setResults([]);
    setIsScraping(true);
    setProgress({ current: 0, total: 0 });
    setCurrentProcessing('');

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
    setProgress({ current: 0, total: validAsins.length });

    // Scrape serially for better rate limit handling, but could be changed to parallel if backend allows
    const newResults: ResultState[] = [];
    for (let i = 0; i < validAsins.length; i++) {
      const asin = validAsins[i];
      
      // التحقق من طلب الإيقاف
      if (shouldStop) {
        console.log('Scraping stopped by user');
        break;
      }

      // تحديث المنتج الحالي والتقدم
      setCurrentProcessing(asin);
      setProgress(prev => ({ ...prev, current: i + 1 }));

      setResults(prev => prev.map(r => r.asin === asin ? { ...r, loading: true } : r));
      
      console.log(`🔄 Starting scraping for ASIN: ${asin} (${i + 1}/${validAsins.length})`);
      try {
        const result = await AmazonScraper.scrapeProduct(asin, options, region);
        if (result.success && result.data) {
          const priceValue = result.data.price
            ? Number(String(result.data.price).replace(/[^0-9.]/g, ''))
            : null;
          newResults.push({ asin, loading: false, data: result.data });
          console.log(`✅ Successfully scraped ASIN: ${asin} (${i + 1}/${validAsins.length})`);
          
          // Save only to amazon_scraping_history
          console.log('Inserting Amazon data:', result.data);
          const { error, data } = await supabase.from('amazon_scraping_history').insert([
            {
              asin: result.data.asin,
              title: result.data.title,
              price: priceValue,
              current_seller: result.data.buyboxWinner,
              data_source: result.data.dataSource,
              scraped_at: new Date().toISOString(),
            }
          ]);
          console.log('Insert result:', { error, data });
        } else {
          // إذا كان المنتج غير متوفر، احفظ البيانات بدون سعر
          if (result.error && result.error.includes('unavailable')) {
            newResults.push({ 
              asin, 
              loading: false, 
              data: { 
                asin: asin,
                title: result.data?.title || 'Product Unavailable',
                price: null, 
                buyboxWinner: null,
                image: null,
                link: null,
                dataSource: 'unavailable'
              } 
            });
            
            // احفظ في قاعدة البيانات مع حالة "unavailable"
            const { error, data } = await supabase.from('amazon_scraping_history').insert([
              {
                asin: asin,
                title: result.data?.title || 'Product Unavailable',
                price: null,
                current_seller: null,
                data_source: 'unavailable',
                scraped_at: new Date().toISOString(),
              }
            ]);
            console.log('Insert unavailable product result:', { error, data });
          } else {
            newResults.push({ asin, loading: false, error: result.error || "Failed to scrape" });
          }
        }
      } catch (error) {
        // التحقق من أن الخطأ ليس بسبب الإيقاف
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Scraping aborted');
          break;
        }
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
    const completed = newResults.filter(r => r.data || r.error);
    
    if (shouldStop) {
      toast({
        title: "Scraping Stopped",
        description: `${completed.length} products processed before stopping.`,
        variant: "destructive",
      });
      playError();
    } else if (failed.length && failed.length !== validAsins.length) {
      toast({
        title: "Some products failed",
        description: `${failed.length} out of ${validAsins.length} ASINs failed.`,
        variant: "destructive",
      });
      playError();
    } else if (failed.length === validAsins.length) {
      toast({
        title: "Failed",
        description: "All product data scrapes failed.",
        variant: "destructive",
      });
      playError();
    } else {
      toast({
        title: "Success",
        description: `${validAsins.length - failed.length}/${validAsins.length} products scraped successfully.`,
        duration: 3000,
      });
      playSuccess();
    }

    setIsScraping(false);
    setShouldStop(false);
    setCurrentProcessing('');
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-2 sm:p-4 md:p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFFFFF] font-inter">
            Product Data Extraction
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#E0E0E0]/80 max-w-2xl mx-auto px-4">
            Enter one or multiple Amazon ASINs to extract detailed product information. 
            Select which data fields you want to retrieve.
          </p>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Side - Settings */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF7A00]" />
                  Scraping Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Amazon Region */}
                <div className="space-y-2">
                  <Label className="text-[#E0E0E0] text-sm sm:text-base">Amazon Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-[#FFFFFF] h-10 sm:h-11">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                      <SelectItem value="eg">Egypt (.eg)</SelectItem>
                      <SelectItem value="ae">UAE (.ae)</SelectItem>
                      <SelectItem value="sa">Saudi Arabia (.sa)</SelectItem>
                      <SelectItem value="com">USA (.com)</SelectItem>
                      <SelectItem value="de">Germany (.de)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#E0E0E0] text-sm sm:text-base">Data Fields to Extract</Label>
                    <button
                      type="button"
                      onClick={() => setShowOptions(!showOptions)}
                      className="flex items-center gap-1 text-xs sm:text-sm text-[#FF7A00] hover:text-[#ff9100] transition-colors"
                    >
                      {showOptions ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {showOptions ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showOptions && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeTitle" className="text-[#E0E0E0] cursor-pointer text-sm">Product Title</Label>
                        <Switch
                          id="includeTitle"
                          checked={options.includeTitle}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeTitle: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includePrice" className="text-[#E0E0E0] cursor-pointer text-sm">Price</Label>
                        <Switch
                          id="includePrice"
                          checked={options.includePrice}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includePrice: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeBuyboxWinner" className="text-[#E0E0E0] cursor-pointer text-sm">Buybox Winner</Label>
                        <Switch
                          id="includeBuyboxWinner"
                          checked={options.includeBuyboxWinner}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeBuyboxWinner: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeImage" className="text-[#E0E0E0] cursor-pointer text-sm">Product Image</Label>
                        <Switch
                          id="includeImage"
                          checked={options.includeImage}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeImage: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeLink" className="text-[#E0E0E0] cursor-pointer text-sm">Product Link</Label>
                        <Switch
                          id="includeLink"
                          checked={options.includeLink}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLink: checked }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4">
                  {isScraping && (
                    <Button
                      onClick={handleStopScraping}
                      variant="destructive"
                      className="w-full h-10 sm:h-11"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Scraping
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - ASIN Input */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2 text-base sm:text-lg">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF7A00]" />
                  Amazon ASINs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ASINInput 
                  onScrape={(asins) => handleScrape(asins, options, region)} 
                  isLoading={isScraping}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading and Status - Full Width */}
        {isScraping && (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-[#E0E0E0]">
                    <span>Progress</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#FF7A00] to-[#ff9100] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-[#A3A3A3]">
                    {Math.round((progress.current / progress.total) * 100)}% Complete
                  </div>
                </div>

                {/* Current Processing */}
                {currentProcessing && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[#FF7A00]" />
                    <span className="text-[#FF7A00] font-medium">Processing: {currentProcessing}</span>
                    <span className="text-[#E0E0E0] hidden sm:inline">Fetching data from Amazon...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results - Full Width */}
        {results.length > 0 && (
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-[#FFFFFF]">Scraped Product Data</h3>
              {results.some(r => r.data) && (
                <Button
                  onClick={() => {
                    const formattedData = results
                      .filter(r => r.data)
                      .map(result => ({
                        source: 'Amazon',
                        code: result.data?.asin || '',
                        title: result.data?.title || '',
                        price: result.data?.price || '',
                        seller: result.data?.buyboxWinner || '',
                        dataSource: result.data?.dataSource || '',
                        image: result.data?.image || '',
                        link: result.data?.link || '',
                        scrapedAt: new Date().toISOString(),
                        status: 'success'
                      }));

                    const exportData = formatAmazonScraperData(formattedData);
                    exportToCSV(exportData, `scraped_products_${new Date().toISOString().split('T')[0]}`, {
                      format: 'csv',
                      encoding: 'utf-8-bom',
                      includeBOM: true
                    });
                  }}
                  className="bg-[#FF7A00] hover:bg-[#ff9100] text-white h-9 sm:h-10"
                  size="sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Export
                </Button>
              )}
            </div>
            
            <div className="w-full overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] shadow-lg">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header */}
                  <div className="flex font-semibold text-[#FFFFFF] border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10 text-xs sm:text-sm">
                    {options.includeImage && <div className="px-3 sm:px-6 py-3 sm:py-4 w-20 sm:w-36 flex-shrink-0">Image</div>}
                    {options.includeTitle && <div className="px-3 sm:px-6 py-3 sm:py-4 flex-1 min-w-0">Title</div>}
                    {options.includePrice && <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">Price</div>}
                    {options.includeBuyboxWinner && <div className="px-3 sm:px-6 py-3 sm:py-4 w-28 sm:w-44 flex-shrink-0">Buybox Winner</div>}
                    <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">Data Source</div>
                    {options.includeLink && <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">Product Link</div>}
                    <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">ASIN</div>
                  </div>
                  
                  {/* Table Body with Scroll */}
                  <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                    {results.filter(result => result.data || result.error).map((result, i) =>
                      result.data ? (
                        <div key={result.asin} className="flex items-center border-b border-[#2A2A2A] hover:bg-[#232323] last:border-b-0 text-xs sm:text-sm transition-colors">
                          {options.includeImage && (
                            <div className="px-3 sm:px-6 py-3 sm:py-4 w-20 sm:w-36 flex-shrink-0">
                              {result.data.image ? (
                                <div className="w-16 h-16 sm:w-28 sm:h-28 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-lg border border-[#2A2A2A] shadow-sm flex items-center justify-center overflow-hidden p-1">
                                  <img 
                                    src={result.data.image} 
                                    alt="Product" 
                                    className="w-full h-full object-cover rounded-md border border-[#3A3A3A]"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 sm:w-28 sm:h-28 flex items-center justify-center text-[#A3A3A3] text-xs border border-[#2A2A2A] bg-[#181818] rounded-lg shadow-sm">
                                  N/A
                                </div>
                              )}
                            </div>
                          )}
                          {options.includeTitle && (
                            <div className="px-3 sm:px-6 py-3 sm:py-4 flex-1 min-w-0">
                              <div className="truncate text-[#FAFAFA] font-medium">
                                {result.data.title || 'N/A'}
                              </div>
                            </div>
                          )}
                          {options.includePrice && (
                            <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">
                              <span className="text-[#FF7A00] font-bold text-sm sm:text-lg">
                                {result.data.price || (result.data.dataSource === 'unavailable' ? 'Unavailable' : 'N/A')}
                              </span>
                            </div>
                          )}
                          {options.includeBuyboxWinner && (
                            <div className="px-3 sm:px-6 py-3 sm:py-4 w-28 sm:w-44 flex-shrink-0 text-[#E0E0E0]">
                              <div className="truncate font-medium">
                                {result.data.buyboxWinner || (result.data.dataSource === 'unavailable' ? 'Unavailable' : 'N/A')}
                              </div>
                            </div>
                          )}
                          <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">
                            {result.data.dataSource ? (
                              result.data.dataSource === 'unavailable' ? (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30">
                                  Unavailable
                                </span>
                              ) : (
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                  result.data.dataSource === 'buying_options' 
                                    ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30' 
                                    : 'bg-[#00A8E8]/20 text-[#00A8E8] border border-[#00A8E8]/30'
                                }`}>
                                  {result.data.dataSource === 'buying_options' ? 'Buying Options' : 'Main Page'}
                                </span>
                              )
                            ) : (
                              <span className="text-[#A3A3A3] text-xs">N/A</span>
                            )}
                          </div>
                          {options.includeLink && (
                            <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">
                              {result.data.link ? (
                                <a 
                                  href={result.data.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#FF7A00] hover:text-[#ff9100] font-medium transition-colors text-xs sm:text-sm"
                                >
                                  View Product →
                                </a>
                              ) : (
                                <span className="text-[#A3A3A3] text-xs">N/A</span>
                              )}
                            </div>
                          )}
                          <div className="px-3 sm:px-6 py-3 sm:py-4 w-24 sm:w-36 flex-shrink-0">
                            <span className="font-mono text-[#FF7A00] font-bold text-xs sm:text-sm">
                              {result.data.asin || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div key={result.asin} className="flex items-center border-b border-[#2A2A2A] last:border-b-0 text-xs sm:text-sm bg-[#1A1A1A] hover:bg-[#232323] transition-colors">
                          <div className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[#FF2F00] w-full flex items-center justify-center gap-2">
                            <span className="text-red-400">⚠</span>
                            <span>Failed to scrape: {result.error}</span>
                          </div>
                        </div>
                      )
                    )}
                    
                    {/* Empty State */}
                    {results.filter(result => result.data || result.error).length === 0 && (
                      <div className="flex items-center justify-center py-8 sm:py-12 text-[#A3A3A3]">
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl mb-2">📊</div>
                          <p className="text-base sm:text-lg font-medium">No results yet</p>
                          <p className="text-xs sm:text-sm">Products will appear here as they are scraped</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

