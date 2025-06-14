import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ExternalLink, Download, Trash2, Calendar, Filter } from 'lucide-react';

interface HistoryItem {
  id: string;
  asin: string;
  title: string;
  price: string;
  buyboxWinner: string;
  scrapedAt: string;
  status: 'success' | 'failed';
  image: string;
}

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  // History data will be loaded from the backend in the future
  const historyData: HistoryItem[] = [];

  const filteredData = historyData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.asin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    console.log('Delete item:', id);
    // In a real app, this would remove the item from the data
  };

  const handleExport = () => {
    console.log('Export data to CSV');
    // In a real app, this would generate a CSV file
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
                    placeholder="Search by ASIN or product title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'all' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  All ({historyData.length})
                </Button>
                <Button
                  variant={filterStatus === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('success')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'success' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Success ({historyData.filter(item => item.status === 'success').length})
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                  className={`text-[#FAFAFA]  ${filterStatus === 'failed' ? 'bg-[#FF7A00] hover:bg-[#ff9100]' : 'border-[#2A2A2A] hover:bg-[#181818]'}`}
                >
                  Failed ({historyData.filter(item => item.status === 'failed').length})
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
                    <TableHead className="text-[#E0E0E0]/90">ASIN</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Price</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Buybox Winner</TableHead>
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
                        {item.asin}
                      </TableCell>
                      <TableCell className="text-[#FF7A00] font-semibold">
                        {item.price}
                      </TableCell>
                      <TableCell className="text-[#E0E0E0]">
                        {item.buyboxWinner}
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
                            onClick={() => window.open(`https://amazon.com/dp/${item.asin}`, '_blank')}
                            className="text-white border-[#2A2A2A] hover:bg-[#1F1F1F]"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
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

            {filteredData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#E0E0E0]/60">No scraped products found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
