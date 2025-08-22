import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ExternalLink, Download, Trash2, Calendar, Filter, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { exportToCSV, formatDataForExport } from '@/utils/exportUtils';

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
  dataSource?: string;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amazonItems = (amazon || []).map((row: any) => ({
        id: row.id || `amazon_${row.asin}_${Date.now()}`,
        code: row.asin || 'N/A',
        title: row.title || 'N/A',
        price: row.price ? String(row.price) : 'N/A',
        buyboxWinner: row.buybox_winner || null,
        seller: row.current_seller || row.seller || null,
        url: row.link || null,
        link: row.link || null,
        scrapedAt: row.scraped_at || new Date().toISOString(),
        status: row.status || 'success',
        image: row.image || null,
        source: 'Amazon' as 'Amazon',
        dataSource: row.data_source || 'main_page',
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const noonItems = (noon || []).map((row: any) => ({
        id: row.id || `noon_${row.product_code}_${Date.now()}`,
        code: row.product_code || 'N/A',
        title: row.title || 'N/A',
        price: row.price ? String(row.price) : 'N/A',
        buyboxWinner: null,
        seller: row.seller || 'N/A',
        url: row.url || null,
        link: row.url || null,
        scrapedAt: row.scraped_at || new Date().toISOString(),
        status: row.status || 'success',
        image: row.image || null,
        source: 'Noon' as 'Noon',
        dataSource: null,
      }));
      // Merge and sort
      const merged = [...amazonItems, ...noonItems].sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime()) as HistoryItem[];
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

  return (
    <div className="min-h-full bg-[#0D0D0D] p-2 sm:p-4 md:p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFFFFF] font-inter">Scraping History</h1>
            <p className="text-sm sm:text-base text-[#E0E0E0]/80">View and manage your scraped product data</p>
          </div>
          <Button
            onClick={() => {
              const formattedData = formatDataForExport(filteredData);
              exportToCSV(formattedData, `scraping_history_${new Date().toISOString().split('T')[0]}`, {
                format: 'csv',
                encoding: 'utf-8-bom',
                includeBOM: true
              });
            }}
            className="bg-[#FF7A00] hover:bg-[#ff9100] text-white shadow-orange-500/40 shadow-md transition-all h-9 sm:h-10 w-full sm:w-auto"
            data-testid="export-csv"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        {/* Filters */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-[#E0E0E0]/60" />
                  <Input
                    placeholder="Search by code or product title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0] h-9 sm:h-10 text-sm w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={filterSource === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('all')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterSource === 'all' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  All ({historyData.length})
                </Button>
                <Button
                  variant={filterSource === 'Amazon' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('Amazon')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterSource === 'Amazon' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Amazon ({historyData.filter(item => item.source === 'Amazon').length})
                </Button>
                <Button
                  variant={filterSource === 'Noon' ? 'default' : 'outline'}
                  onClick={() => setFilterSource('Noon')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterSource === 'Noon' ? 'bg-[#FFD600] hover:bg-[#ffe066] text-black' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Noon ({historyData.filter(item => item.source === 'Noon').length})
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterStatus === 'all' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  All Status
                </Button>
                <Button
                  variant={filterStatus === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('success')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterStatus === 'success' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Success
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                  className={`text-[#FAFAFA] text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none ${filterStatus === 'failed' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Scraped Products ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-[#2A2A2A]/50">
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm hidden sm:table-cell">Code</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm">Price</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm hidden sm:table-cell">Seller</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm hidden md:table-cell">Source</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm hidden lg:table-cell">Data Source</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm hidden md:table-cell">Scraped At</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-[#E0E0E0] font-medium text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="border-[#2A2A2A] hover:bg-[#171717]">
                      <TableCell className="py-2 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {item.image ? (
                          <img 
                            src={item.image} 
                              alt={item.title || 'Product'}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                          />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#2A2A2A] rounded flex items-center justify-center">
                              <span className="text-[#A3A3A3] text-xs">N/A</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-[#FAFAFA] text-xs sm:text-sm max-w-[120px] sm:max-w-xs truncate font-inter">
                              {item.title || 'N/A'}
                            </p>
                            <div className="sm:hidden">
                              <p className="text-[#E0E0E0]/60 text-xs">{item.code || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#E0E0E0] font-mono text-xs sm:text-sm hidden sm:table-cell">
                        {item.code || 'N/A'}
                      </TableCell>
                      <TableCell className="text-[#FF7A00] font-semibold text-xs sm:text-sm">
                        {item.price || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A')}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0] text-xs sm:text-sm hidden sm:table-cell">
                        {item.source === 'Amazon' ? (item.buyboxWinner || item.seller || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A')) : (item.seller || 'N/A')}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0] text-xs sm:text-sm hidden md:table-cell">
                        <Badge variant="outline" className={`text-xs ${
                          item.source === 'Amazon' 
                            ? 'border-[#FF7A00] text-[#FF7A00]' 
                            : 'border-[#FFD600] text-[#FFD600]'
                        }`}>
                          {item.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#E0E0E0] text-xs sm:text-sm hidden lg:table-cell">
                        {item.source === 'Amazon' && item.dataSource ? (
                          item.dataSource === 'unavailable' ? (
                            <Badge variant="destructive" className="text-xs">
                              Unavailable
                            </Badge>
                          ) : (
                            <Badge variant={item.dataSource === 'buying_options' ? 'secondary' : 'default'} className="text-xs">
                              {item.dataSource === 'buying_options' ? 'Buying Options' : 'Main Page'}
                            </Badge>
                          )
                        ) : (
                          <span className="text-[#E0E0E0]/60 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0]/60 text-xs sm:text-sm hidden md:table-cell">
                        {item.scrapedAt ? new Date(item.scrapedAt).toLocaleString('en-US') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {item.status || 'N/A'}
                        </Badge>
                        <div className="md:hidden mt-1">
                          <div className="flex items-center gap-1 text-xs text-[#E0E0E0]/60">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.scrapedAt ? new Date(item.scrapedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          {item.link ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(item.link, '_blank')}
                            className="text-white border-[#2A2A2A] hover:bg-[#1F1F1F] h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="text-[#A3A3A3] border-[#2A2A2A] cursor-not-allowed h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {}}
                            className="text-[#EB5F01] border-[#EB5F01] hover:bg-[#1f150a] h-7 w-7 sm:h-8 sm:w-8 p-0"
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
