import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { MultiDomainScraper, MultiDomainOptions, MultiDomainResult } from '@/services/MultiDomainScraper';
import { Download, Globe, Play, Settings, ChevronDown, ChevronUp, StopCircle, Database } from 'lucide-react';
import { useSoundSettings } from '@/contexts/SoundContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ValidatedTextarea } from '@/components/ui/validated-input';
import { ValidationSchemas } from '@/lib/validation';

interface DomainOption {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

const MultiDomainScraperPage = () => {
  const { toast } = useToast();
  const { playSuccess, playError } = useSoundSettings();
  const [isScraping, setIsScraping] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<MultiDomainResult[]>([]);
  const [processingAsins, setProcessingAsins] = useState<Set<string>>(new Set());
  
  const [asinInput, setAsinInput] = useState('B08N5WRWNW');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['eg', 'sa', 'ae', 'com', 'de']);
  const [showOptions, setShowOptions] = useState(false);
  
  const [options, setOptions] = useState<MultiDomainOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeSeller: true,
    includeLink: true,
    comparePrices: true,
    findBestDeals: true
  });

  const domainOptions = [
    { code: 'eg', name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
    { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
    { code: 'ae', name: 'UAE', flag: '🇦🇪', currency: 'AED' },
    { code: 'com', name: 'USA', flag: '🇺🇸', currency: 'USD' },
    { code: 'de', name: 'Germany', flag: '🇩🇪', currency: 'EUR' }
  ];

  const handleStopScraping = () => {
    setShouldStop(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScraping(false);
    toast({
      title: "Multi-Domain Scraping Stopped",
      description: "The scraping process has been stopped.",
      variant: "destructive",
    });
  };

  const handleTestCompleteProcess = async () => {
    try {
      console.log('🧪 Testing complete process...');
      
      const completeTest = await MultiDomainScraper.testCompleteProcess();
      if (!completeTest.success) {
        toast({
          title: "Complete Process Test Failed",
          description: completeTest.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Complete Process Test Successful",
        description: "Scraping and saving are working correctly!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Complete Process Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleTestBackend = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      
      const backendTest = await MultiDomainScraper.testBackendConnection();
      if (!backendTest.success) {
        toast({
          title: "Backend Connection Failed",
          description: backendTest.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Backend Test Successful",
        description: "Backend is working correctly!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Backend Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleScrape = async () => {
    setShouldStop(false);
    abortControllerRef.current = new AbortController();
    
    const rawAsins = asinInput.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    const validAsins = Array.from(new Set(rawAsins.filter(asin => MultiDomainScraper.validateASIN(asin))));
    
    setResults([]);
    setIsScraping(true);
    setProgress({ current: 0, total: 0 });
    setCurrentProcessing('');
    setProcessingAsins(new Set(validAsins));
    const invalidAsins = rawAsins.filter(asin => !MultiDomainScraper.validateASIN(asin));

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

    if (selectedDomains.length === 0) {
      toast({
        title: "No Domains Selected",
        description: "Please select at least one domain to scrape from.",
        variant: "destructive",
      });
      setIsScraping(false);
      return;
    }

    const totalOperations = validAsins.length * selectedDomains.length;
    setProgress({ current: 0, total: totalOperations });

    try {
      console.log('🚀 Starting scraping process...');
      console.log('📋 Valid ASINs:', validAsins);
      console.log('🌐 Selected domains:', selectedDomains);
      
      const handleProgressUpdate = (result: MultiDomainResult, currentIndex: number, total: number) => {
        console.log(`📈 Progressive update: ${currentIndex}/${total}`, result);
        
        setResults(prevResults => {
          const existingIndex = prevResults.findIndex(r => r.asin === result.asin);
          if (existingIndex >= 0) {
            const newResults = [...prevResults];
            newResults[existingIndex] = result;
            return newResults;
          } else {
            return [...prevResults, result];
          }
        });
        
        setProgress({ current: currentIndex, total });
        setCurrentProcessing('');
        
        setProcessingAsins(prev => {
          const newSet = new Set(prev);
          newSet.delete(result.asin);
          return newSet;
        });
        
        toast({
          title: `✅ Product ${currentIndex}/${total} Complete`,
          description: `${result.asin}: ${result.title || 'Scraped'} from ${selectedDomains.length} domains`,
          duration: 2000,
        });
      };
      
      const { success, results: scrapeResults, error } = await MultiDomainScraper.scrapeMultiDomain(
        validAsins,
        selectedDomains,
        options,
        handleProgressUpdate
      );

      console.log('📊 Scraping result:', { success, error, resultsCount: scrapeResults?.length });

      if (shouldStop) {
        toast({
          title: "Scraping Stopped",
          description: `${progress.current} operations completed before stopping.`,
          variant: "destructive",
        });
        playError();
      } else if (success && scrapeResults) {
        toast({
          title: "🎉 Multi-Domain Scraping Complete",
          description: `Successfully scraped ${scrapeResults.length} products across ${selectedDomains.length} domains.`,
          duration: 3000,
        });
        playSuccess();
      } else {
        toast({
          title: "Scraping Failed",
          description: error || "Failed to scrape products",
          variant: "destructive",
        });
        playError();
      }
    } catch (error) {
      console.error('💥 Scraping error:', error);
      const message = error instanceof Error ? error.message : 'Failed to scrape';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      playError();
    }

    setIsScraping(false);
    setShouldStop(false);
    setCurrentProcessing('');
    setProgress({ current: 0, total: 0 });
    setProcessingAsins(new Set());
  };

  const handleDomainToggle = (domainCode: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainCode)
        ? prev.filter(d => d !== domainCode)
        : [...prev, domainCode]
    );
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please scrape some data first before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = results.map(result => {
        const row: any = {
          ASIN: result.asin,
          Title: result.title || 'N/A',
        };

        domainOptions.forEach(domain => {
          const domainData = result.results.find(d => d.domain === domain.code);
          if (domainData) {
            row[`${domain.name} Price`] = domainData.price ? `${domainData.currency} ${domainData.price}` : 'N/A';
            row[`${domain.name} Status`] = domainData.status;
          } else {
            row[`${domain.name} Price`] = 'N/A';
            row[`${domain.name} Status`] = 'Not scraped';
          }
        });

        return row;
      });

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `multi-domain-results-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${results.length} products to CSV file.`,
        duration: 3000,
      });

      playSuccess();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
      playError();
    }
  };

  const handleTestDatabase = async () => {
    try {
      console.log('🧪 Testing database connection...');
      
      const connectionTest = await MultiDomainScraper.testDatabaseConnection();
      if (!connectionTest.success) {
        toast({
          title: "Database Connection Failed",
          description: connectionTest.error,
          variant: "destructive",
        });
        return;
      }

      const insertTest = await MultiDomainScraper.testDatabaseInsert();
      if (!insertTest.success) {
        toast({
          title: "Database Insert Failed",
          description: insertTest.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Database Test Successful",
        description: "Connection and insert tests passed!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Database Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleTestRealData = async () => {
    try {
      console.log('🧪 Testing real data insert...');
      
      const realDataTest = await MultiDomainScraper.testRealDataInsert();
      if (!realDataTest.success) {
        toast({
          title: "Real Data Insert Failed",
          description: realDataTest.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Real Data Test Successful",
        description: "Data saved to multi_domain_scraping_history!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Real Data Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const getDomainFlag = (domainCode: string) => {
    return domainOptions.find(d => d.code === domainCode)?.flag || '🌍';
  };

  const getDomainName = (domainCode: string) => {
    return domainOptions.find(d => d.code === domainCode)?.name || domainCode;
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-2 sm:p-4 md:p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFFFFF] font-inter flex items-center gap-2 sm:gap-3">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF7A00]" />
              Multi-Domain Scraper
            </h1>
            <p className="text-sm sm:text-base text-[#E0E0E0]/80 mt-2">
              Scrape product data from multiple Amazon domains simultaneously
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExport}
              disabled={results.length === 0}
              className="bg-[#FF7A00] hover:bg-[#ff9100] text-white shadow-orange-500/40 shadow-md transition-all h-9 sm:h-10"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Export Results
            </Button>
            <Button
              onClick={handleTestDatabase}
              variant="outline"
              className="border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A] h-9 sm:h-10"
            >
              <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Test DB
            </Button>
            <Button
              onClick={handleTestBackend}
              variant="outline"
              className="border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A] h-9 sm:h-10"
            >
              <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Test Backend
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Settings */}
          <div className="xl:col-span-1 order-2 xl:order-1 space-y-4 sm:space-y-6">
            {/* Domain Selection */}
            <Card className="dashboard-card border-[#2A2A2A]">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2 text-base sm:text-lg">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF7A00]" />
                  Select Domains
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {domainOptions.map((domain) => (
                    <div key={domain.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`domain-${domain.code}`}
                        checked={selectedDomains.includes(domain.code)}
                        onCheckedChange={() => handleDomainToggle(domain.code)}
                        className="border-[#2A2A2A] data-[state=checked]:bg-[#FF7A00] data-[state=checked]:border-[#FF7A00]"
                      />
                      <Label
                        htmlFor={`domain-${domain.code}`}
                        className="text-[#E0E0E0] cursor-pointer flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <span className="text-base sm:text-lg">{domain.flag}</span>
                        <span className="hidden sm:inline">{domain.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {domain.currency}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#A3A3A3]">
                  Selected: {selectedDomains.length} domain(s)
                </p>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="dashboard-card border-[#2A2A2A]">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF7A00]" />
                  <div className="flex items-center justify-between w-full">
                    <span>Scraping Options</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptions(!showOptions)}
                      className="text-[#A3A3A3] hover:text-[#FFFFFF] h-8 w-8 p-0"
                    >
                      {showOptions ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {showOptions && (
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#E0E0E0] text-xs sm:text-sm">Include Title</Label>
                      <Switch
                        checked={options.includeTitle}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeTitle: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[#E0E0E0] text-xs sm:text-sm">Include Image</Label>
                      <Switch
                        checked={options.includeImage}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeImage: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[#E0E0E0] text-xs sm:text-sm">Include Price</Label>
                      <Switch
                        checked={options.includePrice}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includePrice: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[#E0E0E0] text-xs sm:text-sm">Include Seller</Label>
                      <Switch
                        checked={options.includeSeller}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeSeller: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[#E0E0E0] text-xs sm:text-sm">Include Link</Label>
                      <Switch
                        checked={options.includeLink}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLink: checked }))}
                      />
                    </div>
                    <div className="border-t border-[#2A2A2A] pt-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[#E0E0E0] text-xs sm:text-sm">Compare Prices</Label>
                        <Switch
                          checked={options.comparePrices}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, comparePrices: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Label className="text-[#E0E0E0] text-xs sm:text-sm">Find Best Deals</Label>
                        <Switch
                          checked={options.findBestDeals}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, findBestDeals: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Stop Button */}
            {isScraping && (
              <Button
                onClick={handleStopScraping}
                variant="destructive"
                className="w-full h-10 sm:h-11"
                data-testid="stop-multi-scraping"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Multi-Domain Scraping
              </Button>
            )}
          </div>

          {/* Right Column - Input */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            {/* ASIN Input */}
            <Card className="dashboard-card border-[#2A2A2A]">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-[#FFFFFF] text-base sm:text-lg">Amazon ASINs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <ValidatedTextarea
                    value={asinInput}
                    onChange={(e) => setAsinInput(e.target.value)}
                    rows={3}
                    className="w-full bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] placeholder-[#A3A3A3] focus:border-[#FF7A00] font-inter rounded resize-y text-sm sm:text-base"
                    placeholder="Enter ASINs separated by commas, spaces, or new lines (e.g., B08N5WRWNW, B0C42HJRBF, B002QYW8LW)"
                    disabled={isScraping}
                    validationType="asin"
                    schema={ValidationSchemas.multiDomainScraping}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-[#A3A3A3]">
                      Enter one or more 10-character Amazon ASINs
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleScrape}
                  disabled={isScraping || !asinInput.trim() || selectedDomains.length === 0}
                  className="w-full bg-[#FF7A00] hover:bg-[#ff9100] text-white font-semibold h-10 sm:h-11"
                  data-testid="start-multi-scraping"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isScraping ? 'Scraping...' : 'Start Multi-Domain Scraping'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress - Full Width */}
        {isScraping && (
          <Card className="dashboard-card border-[#2A2A2A] mt-4 sm:mt-6">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[#E0E0E0]">Progress</span>
                  <span className="text-[#FF7A00] font-medium">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <Progress 
                  value={(progress.current / progress.total) * 100} 
                  className="h-2"
                />
                {currentProcessing && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#A3A3A3]">
                    <span>Processing:</span>
                    <span className="text-[#FF7A00] font-mono">{currentProcessing}</span>
                    <span className="hidden sm:inline">Fetching data from Amazon...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Full Width */}
        {!isScraping && results.length === 0 && (
          <Card className="dashboard-card border-[#2A2A2A] mt-4 sm:mt-6">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-[#A3A3A3]" />
                </div>
                <h3 className="text-[#FFFFFF] font-semibold mb-2 text-base sm:text-lg">No Results Yet</h3>
                <p className="text-[#A3A3A3] text-xs sm:text-sm">
                  Start scraping to see multi-domain results here
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results - Full Width */}
        {results.length > 0 && (
          <Card className="dashboard-card border-[#2A2A2A] mt-4 sm:mt-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-[#FFFFFF] text-base sm:text-lg">Multi-Domain Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2A2A]">
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">Image</th>
                      <th className="text-left p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">Title</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">ASIN</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">🇪🇬 Egypt</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">🇸🇦 Saudi Arabia</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">🇦🇪 UAE</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">🇺🇸 USA</th>
                      <th className="text-center p-2 sm:p-4 text-[#FFFFFF] font-semibold text-xs sm:text-sm">🇩🇪 Germany</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* عرض ASINs قيد المعالجة */}
                    {Array.from(processingAsins).map((asin) => (
                      <tr key={`processing-${asin}`} className="border-b border-[#2A2A2A]/50 bg-[#1A1A1A]/30">
                        {/* Image Column - Loading */}
                        <td className="p-2 sm:p-4 text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-lg border border-[#2A2A2A] flex items-center justify-center mx-auto">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>

                        {/* Title Column - Loading */}
                        <td className="p-2 sm:p-4">
                          <div className="space-y-2">
                            <Badge variant="outline" className="font-mono text-[#FF7A00] text-xs mb-2">
                              {asin}
                            </Badge>
                            <div className="w-full h-3 sm:h-4 bg-gray-600 rounded animate-pulse"></div>
                            <div className="w-3/4 h-2 sm:h-3 bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </td>

                        {/* Price Columns - Loading */}
                        {['eg', 'sa', 'ae', 'com', 'de'].map((domainCode) => (
                          <td key={domainCode} className="p-2 sm:p-4 text-center">
                            <div className="space-y-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mx-auto"></div>
                              <div className="w-12 h-3 sm:w-16 sm:h-4 bg-gray-600 rounded animate-pulse mx-auto"></div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    {/* عرض النتائج المكتملة */}
                    {results.map((result, index) => (
                      <tr key={result.asin} className="border-b border-[#2A2A2A]/50">
                        {/* Image Column */}
                        <td className="p-2 sm:p-4 text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-lg border border-[#2A2A2A] shadow-sm flex items-center justify-center overflow-hidden mx-auto">
                            {result.results.find(r => r.imageUrl)?.imageUrl ? (
                              <img 
                                src={result.results.find(r => r.imageUrl)?.imageUrl} 
                                alt="Product" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#A3A3A3] text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Title Column */}
                        <td className="p-2 sm:p-4">
                          <div className="max-w-[120px] sm:max-w-xs">
                            <h3 className="text-[#FFFFFF] font-semibold text-xs sm:text-sm line-clamp-3">
                              {result.title || `Product ${index + 1}`}
                            </h3>
                          </div>
                        </td>
                        
                        {/* ASIN Column */}
                        <td className="p-2 sm:p-4 text-center">
                          <Badge variant="outline" className="font-mono text-[#FF7A00] text-xs">
                            {result.asin}
                          </Badge>
                        </td>
                        
                        {/* Price Columns - Each Domain */}
                        {['eg', 'sa', 'ae', 'com', 'de'].map((domainCode) => {
                          const domainResult = result.results.find(r => r.domain === domainCode);
                          
                          return (
                            <td key={domainCode} className="p-2 sm:p-4 text-center">
                              {domainResult ? (
                                <div className="space-y-1">
                                  {/* Status Indicator */}
                                  <div className="flex justify-center">
                                    {domainResult.status === 'success' ? (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    ) : domainResult.status === 'unavailable' ? (
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    ) : (
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                  </div>
                                  
                                  {/* Price */}
                                  {domainResult.price ? (
                                    <div className="text-[#FF7A00] font-bold text-xs sm:text-sm">
                                      {domainResult.price}
                                    </div>
                                  ) : (
                                    <div className="text-[#A3A3A3] text-xs">
                                      {domainResult.status === 'unavailable' ? 'Unavailable' : 'Failed'}
                                    </div>
                                  )}
                                  
                                  {/* Currency */}
                                  {domainResult.price && domainResult.currency && (
                                    <div className="text-[#A3A3A3] text-xs">
                                      {domainResult.currency}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[#A3A3A3] text-xs">
                                  Not Selected
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiDomainScraperPage;