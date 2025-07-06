import React, { useEffect, useState } from 'react';
import { CompetitorService } from '@/services/CompetitorService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/supabaseClient';

interface Competitor {
  id: string;
  seller_name: string;
  platform: string;
  product_count: number;
  product_codes?: string[];
  is_ignored?: boolean;
}

const Competitors: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<'all' | 'Amazon' | 'Noon'>('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const data = await CompetitorService.getCompetitorsExcludingMine();
      setCompetitors(data || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleIgnore = async (seller_name: string, platform: string) => {
    await CompetitorService.setCompetitorIgnored(seller_name, platform, true);
    fetchCompetitors();
  };

  const filtered = competitors.filter(c => {
    const matchesSearch = c.seller_name.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === 'all' || c.platform === platform;
    return matchesSearch && matchesPlatform;
  });

  const fetchProducts = async (competitor: Competitor) => {
    setProductsLoading(true);
    let data = [];
    if (competitor.platform === 'Amazon') {
      const { data: rows } = await supabase
        .from('amazon_scraping_history')
        .select('*')
        .eq('current_seller', competitor.seller_name)
        .in('asin', competitor.product_codes || []);
      data = rows || [];
    } else {
      const { data: rows } = await supabase
        .from('noon_scraping_history')
        .select('*')
        .eq('seller', competitor.seller_name)
        .in('product_code', competitor.product_codes || []);
      data = rows || [];
    }
    setProducts(data);
    setProductsLoading(false);
  };

  const handleExpand = async (competitor: Competitor) => {
    if (expanded === competitor.id) {
      setExpanded(null);
      setProducts([]);
    } else {
      setExpanded(competitor.id);
      await fetchProducts(competitor);
    }
  };

  const handleExport = () => {
    if (!competitors.length) return;
    // Find max product codes count
    const maxCodes = Math.max(...competitors.map(c => c.product_codes?.length || 0));
    const headers = ['Seller Name', 'Platform', '# Products'];
    for (let i = 1; i <= maxCodes; i++) headers.push(`Product Code ${i}`);
    const rows = competitors.map(c => {
      const base = [c.seller_name, c.platform, c.product_count];
      const codes = c.product_codes || [];
      for (let i = codes.length; i < maxCodes; i++) codes.push('');
      return [...base, ...codes];
    });
    const csv = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'competitors_export.csv');
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              Competitors ({filtered.length})
              <Button size="sm" className="ml-4" onClick={handleExport}>Export</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by seller name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0] max-w-xs"
              />
              <div className="flex gap-2">
                <button onClick={() => setPlatform('all')} className={`px-3 py-1 rounded ${platform==='all' ? 'bg-[#FF7A00] text-white' : 'bg-[#232323] text-[#E0E0E0]'}`}>All</button>
                <button onClick={() => setPlatform('Amazon')} className={`px-3 py-1 rounded ${platform==='Amazon' ? 'bg-[#FF7A00] text-white' : 'bg-[#232323] text-[#E0E0E0]'}`}>Amazon</button>
                <button onClick={() => setPlatform('Noon')} className={`px-3 py-1 rounded ${platform==='Noon' ? 'bg-[#FFD600] text-black' : 'bg-[#232323] text-[#E0E0E0]'}`}>Noon</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]">
                    <TableHead className="text-[#E0E0E0]/90">Seller Name</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Platform</TableHead>
                    <TableHead className="text-[#E0E0E0]/90"># Products</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Product Codes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No competitors found.</TableCell></TableRow>
                  ) : filtered.map(c => [
                    <TableRow key={c.id} className="border-[#2A2A2A]">
                      <TableCell className="text-[#FAFAFA]">{c.seller_name}</TableCell>
                      <TableCell>
                        <Badge variant={c.platform === 'Amazon' ? 'default' : 'secondary'}>{c.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-[#FF7A00] font-bold">{c.product_count}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleExpand(c)}>
                          View Products
                        </Button>
                      </TableCell>
                    </TableRow>,
                    expanded === c.id && (
                      <TableRow key={c.id + '-products'}>
                        <TableCell colSpan={4} className="bg-[#181818] p-4">
                          {productsLoading ? (
                            <div>Loading...</div>
                          ) : products.length === 0 ? (
                            <div>No products for this competitor.</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Image</TableHead>
                                  <TableHead>Title</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Link</TableHead>
                                  <TableHead>Code</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {products.map((p, i) => (
                                  <TableRow key={i}>
                                    <TableCell>{p.image ? <img src={p.image} alt="img" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '-'}</TableCell>
                                    <TableCell>{p.title || '-'}</TableCell>
                                    <TableCell>{p.price || '-'}</TableCell>
                                    <TableCell>{p.link || p.url ? <a href={p.link || p.url} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</TableCell>
                                    <TableCell>{p.asin || p.product_code || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  ])}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Competitors; 