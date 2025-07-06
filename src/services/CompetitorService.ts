import { supabase } from '@/lib/supabaseClient';

export const CompetitorService = {
  // My Seller Accounts
  async getMySellers() {
    const { data, error } = await supabase.from('my_seller_accounts').select('*');
    if (error) throw error;
    return data;
  },
  async addMySeller(seller_name: string, platform: string) {
    const { data, error } = await supabase.from('my_seller_accounts').insert([{ seller_name, platform }]);
    if (error) throw error;
    return data;
  },
  async removeMySeller(seller_name: string) {
    const { data, error } = await supabase.from('my_seller_accounts').delete().eq('seller_name', seller_name);
    if (error) throw error;
    return data;
  },
  // Competitors
  async getCompetitors() {
    const { data, error } = await supabase.from('competitors').select('*');
    if (error) throw error;
    return data;
  },
  async getCompetitorsExcludingMine() {
    const mySellers = await this.getMySellers();
    const { data, error } = await supabase.from('competitors').select('*').eq('is_ignored', false);
    if (error) throw error;
    if (!mySellers.length) return data;
    // Exclude competitors that match both seller_name and platform
    const filtered = (data || []).filter((c: any) => {
      return !mySellers.some((s: any) => s.seller_name === c.seller_name && s.platform === c.platform);
    });
    return filtered;
  },
  async upsertCompetitor(seller_name: string, platform: string, product_code?: string) {
    // Fetch current competitor
    const { data: existing } = await supabase.from('competitors').select('*').eq('seller_name', seller_name).eq('platform', platform).single();
    let product_codes = existing?.product_codes || [];
    let product_count = existing?.product_count || 0;
    if (product_code && !product_codes.includes(product_code)) {
      product_codes = [...product_codes, product_code];
      product_count = product_codes.length;
    }
    const { data, error } = await supabase.from('competitors').upsert([
      { seller_name, platform, product_codes, product_count, is_ignored: false }
    ], { onConflict: 'seller_name,platform' });
    if (error) throw error;
    return data;
  },
  async setCompetitorIgnored(seller_name: string, platform: string, ignored: boolean) {
    const { data, error } = await supabase.from('competitors').update({ is_ignored: ignored }).eq('seller_name', seller_name).eq('platform', platform);
    if (error) throw error;
    return data;
  },
  async isMySeller(seller_name: string) {
    const { data, error } = await supabase.from('my_seller_accounts').select('seller_name').eq('seller_name', seller_name);
    if (error) throw error;
    return data && data.length > 0;
  },
  async syncCompetitors() {
    // Amazon sellers
    const { data: amazonSellers } = await supabase
      .from('amazon_scraping_history')
      .select('current_seller, asin')
      .neq('current_seller', null);
    const amazonMap = {};
    (amazonSellers || []).forEach(row => {
      if (!row.current_seller) return;
      if (!amazonMap[row.current_seller]) amazonMap[row.current_seller] = [];
      amazonMap[row.current_seller].push(row.asin);
    });
    // Noon sellers
    const { data: noonSellers } = await supabase
      .from('noon_scraping_history')
      .select('seller, product_code')
      .neq('seller', null);
    const noonMap = {};
    (noonSellers || []).forEach(row => {
      if (!row.seller) return;
      if (!noonMap[row.seller]) noonMap[row.seller] = [];
      noonMap[row.seller].push(row.product_code);
    });
    // Upsert Amazon competitors
    for (const seller in amazonMap) {
      await supabase.from('competitors').upsert([
        {
          seller_name: seller,
          platform: 'Amazon',
          product_count: amazonMap[seller].length,
          product_codes: amazonMap[seller],
          is_ignored: false
        }
      ], { onConflict: 'seller_name,platform' });
    }
    // Upsert Noon competitors
    for (const seller in noonMap) {
      await supabase.from('competitors').upsert([
        {
          seller_name: seller,
          platform: 'Noon',
          product_count: noonMap[seller].length,
          product_codes: noonMap[seller],
          is_ignored: false
        }
      ], { onConflict: 'seller_name,platform' });
    }
  },
}; 