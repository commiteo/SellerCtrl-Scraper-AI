import React, { useEffect, useState } from 'react';
import { CompetitorService } from '@/services/CompetitorService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

interface SellerAccount {
  id: string;
  seller_name: string;
  platform: string;
}

const MySellerAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [sellerName, setSellerName] = useState('');
  const [platform, setPlatform] = useState('Amazon');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await CompetitorService.getMySellers();
      setAccounts(data || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, [platform, accounts]);

  const handleSellerInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellerName(value);
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let sellers: string[] = [];
    if (platform === 'Amazon') {
      const { data } = await supabase
        .from('amazon_scraping_history')
        .select('current_seller')
        .neq('current_seller', null);
      sellers = Array.from(new Set((data || []).map((r: any) => r.current_seller)));
    } else {
      const { data } = await supabase
        .from('noon_scraping_history')
        .select('seller')
        .neq('seller', null);
      sellers = Array.from(new Set((data || []).map((r: any) => r.seller)));
    }
    // Exclude already added
    const already = accounts.filter(a => a.platform === platform).map(a => a.seller_name);
    const filtered = sellers.filter(s => s && s.toLowerCase().includes(value.toLowerCase()) && !already.includes(s));
    setSuggestions(filtered.slice(0, 8));
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (name: string) => {
    setSellerName(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName) return;
    await CompetitorService.addMySeller(sellerName, platform);
    setSellerName('');
    fetchAccounts();
  };

  const handleRemove = async (seller_name: string) => {
    await CompetitorService.removeMySeller(seller_name);
    fetchAccounts();
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              My Seller Accounts ({accounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
              <Input
                placeholder="Seller name..."
                value={sellerName}
                onChange={handleSellerInput}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                className="bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0]"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 bg-[#232323] border border-[#2A2A2A] rounded w-[220px] mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map(s => (
                    <div
                      key={s}
                      className="px-3 py-2 cursor-pointer hover:bg-[#333] text-[#E0E0E0]"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0] px-3 py-2 rounded">
                <option value="Amazon">Amazon</option>
                <option value="Noon">Noon</option>
              </select>
              <Button type="submit" className="bg-[#FF7A00] text-white">Add</Button>
            </form>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]">
                    <TableHead className="text-[#E0E0E0]/90">Seller Name</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Platform</TableHead>
                    <TableHead className="text-[#E0E0E0]/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                  ) : accounts.length === 0 ? (
                    <TableRow><TableCell colSpan={3}>No seller accounts found.</TableCell></TableRow>
                  ) : accounts.map(acc => (
                    <TableRow key={acc.id} className="border-[#2A2A2A]">
                      <TableCell className="text-[#FAFAFA]">{acc.seller_name}</TableCell>
                      <TableCell>{acc.platform}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleRemove(acc.seller_name)}>
                          Remove
                        </Button>
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

export default MySellerAccounts; 