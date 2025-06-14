
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

  // Mock history data
  const historyData: HistoryItem[] = [
    {
      id: '1',
      asin: 'B08N5WRWNW',
      title: 'Echo Dot (4th Gen) Smart speaker with Alexa',
      price: '$49.99',
      buyboxWinner: 'Amazon.com',
      scrapedAt: '2024-06-14 10:30:00',
      status: 'success',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      asin: 'B0B7RFBVYX',
      title: 'iPhone 14 Pro Max Silicone Case with MagSafe',
      price: '$49.00',
      buyboxWinner: 'Apple',
      scrapedAt: '2024-06-14 09:15:00',
      status: 'success',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop'
    },
    {
      id: '3',
      asin: 'B09DFCB8Q4',
      title: 'Anker Wireless Charger, PowerWave Pad Qi-Certified',
      price: 'N/A',
      buyboxWinner: 'N/A',
      scrapedAt: '2024-06-14 08:45:00',
      status: 'failed',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop'
    },
    {
      id: '4',
      asin: 'B08FBM7G5J',
      title: 'Logitech G Pro X Superlight Wireless Gaming Mouse',
      price: '$149.99',
      buyboxWinner: 'Logitech',
      scrapedAt: '2024-06-13 16:20:00',
      status: 'success',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop'
    },
    {
      id: '5',
      asin: 'B07PFFMP9P',
      title: 'Echo Show 5 (2nd Gen) Smart display with Alexa',
      price: '$84.99',
      buyboxWinner: 'Amazon.com',
      scrapedAt: '2024-06-13 14:10:00',
      status: 'success',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    }
  ];

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
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Scraping History</h1>
            <p className="text-gray-400">View and manage your scraped product data</p>
          </div>
          <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by ASIN or product title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="text-white"
                >
                  All ({historyData.length})
                </Button>
                <Button
                  variant={filterStatus === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('success')}
                  className="text-white"
                >
                  Success ({historyData.filter(item => item.status === 'success').length})
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                  className="text-white"
                >
                  Failed ({historyData.filter(item => item.status === 'failed').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scraped Products ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Product</TableHead>
                    <TableHead className="text-gray-300">ASIN</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Buybox Winner</TableHead>
                    <TableHead className="text-gray-300">Scraped At</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-white text-sm max-w-xs truncate">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">
                        {item.asin}
                      </TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        {item.price}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {item.buyboxWinner}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
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
                            className="text-white border-gray-600 hover:bg-gray-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 border-red-400 hover:bg-red-900"
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
                <p className="text-gray-400">No scraped products found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
