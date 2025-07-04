import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ExternalLink, Download, Trash2, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface HistoryItem {
  id: string;
  code: string;
  title?: string;
  price?: string;
  buyboxWinner?: string;
  seller?: string;
  url?: string;
  link?: string;
  scrapedAt: string;
  status: 'success' | 'failed';
  image?: string;
  source: 'Amazon' | 'Noon';
}

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'Amazon' | 'Noon'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      // Fetch Amazon
      const { data: amazon, error: amazonError } = await supabase
        .from('amazon_scraping_history')
        .select('*')
        .order('scraped_at', { ascending: false });
      // Fetch Noon
      const { data: noon, error: noonError } = await supabase
        .from('noon_scraping_history')
        .select('*')
        .order('scraped_at', { ascending: false });
      const amazonItems = (amazon || []).map((row: any) => ({
        id: row.id,
        code: row.asin,
        title: row.title,
        price: row.price,
        buyboxWinner: row.buybox_winner,
        seller: undefined,
        url: row.link,
        link: row.link,
        scrapedAt: row.scraped_at,
        status: row.status,
        image: row.image,
        source: 'Amazon',
      }));
      const noonItems = (noon || []).map((row: any) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        price: row.price,
        buyboxWinner: undefined,
        seller: row.seller,
        url: row.url,
        link: row.url,
        scrapedAt: row.scraped_at,
        status: row.status,
        image: row.image,
        source: 'Noon',
      }));
      // Merge and sort
      const merged = [...amazonItems, ...noonItems].sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());
      setHistoryData(merged);
    };
    fetchHistory();
  }, []);

  const filteredData = historyData.filter(item => {
    const matchesSearch = (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = filterSource === 'all' || item.source === filterSource;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleExport = () => {
    // Export filteredData to CSV
    const headers = ['Source', 'Code', 'Title', 'Price', 'Seller', 'Link', 'Scraped At', 'Status'];
    const rows = filteredData.map(item => [
      item.source,
      item.code,
      item.title,
      item.price,
      item.source === 'Amazon' ? (item.buyboxWinner || item.seller) : item.seller,
      item.link,
      item.scrapedAt,
      item.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => '"' + (x ?? '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraping_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF] font-inter">Scraping History</h1>
            <p className="text-[#E0E0E0]/80">View and manage your scraped product data</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-[#FF7A00] hover:bg-[#ff9100] text-white shadow-orange-500/40 shadow-md transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
        {/* Filters */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E0E0E0]/60" />
                  <Input
                    placeholder="Search by code or product title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterSource === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('all')}
                  className={`text-[#FAFAFA]  ${filterSource === 'all' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  All ({historyData.length})
                </Button>
                <Button
                  variant={filterSource === 'Amazon' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('Amazon')}
                  className={`text-[#FAFAFA]  ${filterSource === 'Amazon' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Amazon ({historyData.filter(item => item.source === 'Amazon').length})
                </Button>
                <Button
                  variant={filterSource === 'Noon' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('Noon')}
                  className={`text-[#FAFAFA]  ${filterSource === 'Noon' ? 'bg-[#FFD600] hover:bg-[#ffe066] text-black' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Noon ({historyData.filter(item => item.source === 'Noon').length})
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'all' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  All Status
                </Button>
                <Button
                  variant={filterStatus === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('success')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'success' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Success
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'failed' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scraped Products ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]">
                    <TableHead className="text-[#E0E0E0]/90">Product</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Code</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Price</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Seller</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Source</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Scraped At</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Status</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="border-[#2A2A2A] hover:bg-[#171717]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-[#FAFAFA] text-sm max-w-xs truncate font-inter">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#E0E0E0] font-mono text-sm">
                        {item.code}
                      </TableCell>
                      <TableCell className="text-[#FF7A00] font-semibold">
                        {item.price}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0]">
                        {item.source === 'Amazon' ? (item.buyboxWinner || item.seller) : item.seller}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0]">
                        {item.source}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0]/60 text-sm">
                        {new Date(item.scrapedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(item.link, '_blank')}
                            className="text-white border-[#2A2A2A] hover:bg-[#1F1F1F]"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {}}
                            className="text-[#EB5F01] border-[#EB5F01] hover:bg-[#1f150a]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
