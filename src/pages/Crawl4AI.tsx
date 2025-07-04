import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Crawl4AIService } from '@/services/Crawl4AI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Crawl4AIPage = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    const res = await Crawl4AIService.scrape(url);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to crawl', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#FFFFFF]">Crawl Any Link</h2>
          <p className="text-[#E0E0E0]/80">Enter a product link to extract data using Crawl4AI and Gemini.</p>
        </div>
        <div className="flex gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/product" className="flex-1" />
          <Button onClick={handleScrape} disabled={loading || !url.trim()}> {loading ? 'Scraping...' : 'Scrape'} </Button>
        </div>
        {result && (
          <pre className="bg-[#1F1F1F] p-4 rounded text-[#E0E0E0] overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default Crawl4AIPage;
