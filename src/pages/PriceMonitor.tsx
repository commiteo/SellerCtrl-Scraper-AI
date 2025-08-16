import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSoundSettings } from '@/contexts/SoundContext';
import { exportToCSV } from '@/utils/exportUtils';
import { AmazonScraper } from '@/services/AmazonScraper';
import { usePriceMonitor } from '@/contexts/PriceMonitorContext';
import * as ExcelJS from 'exceljs';

interface MonitoredProduct {
  id: string;
  asin: string;
  title?: string;
  image_url?: string; // صورة المنتج
  current_price?: string; // السعر مع العملة كـ string فقط
  previous_price?: string; // السعر السابق مع العملة كـ string
  price_change?: number;
  price_change_percentage?: number;
  last_scraped: string;
  next_scrape: string;
  is_active: boolean; // تم العودة لـ is_active
  region: string;
  scrape_interval: number; // in minutes
  alert_threshold?: number; // percentage change to trigger alert
  seller_name?: string; // تم العودة لـ seller_name
  seller_id?: string;
  has_buybox?: boolean;
  buybox_price?: number;
  total_offers?: number;
  selected_account?: string; // الحساب المختار للمنتج
  created_at: string;
  updated_at: string;
}

interface PriceHistory {
  id: string;
  product_id: string;
  asin: string;
  price: number;
  price_display?: string; // السعر مع العملة
  scraped_at: string;
  region: string;
}

interface SellerInfo {
  id: string;
  product_id: string;
  asin: string;
  seller_name: string;
  seller_id: string;
  has_buybox: boolean;
  buybox_price: number;
  total_offers: number;
  region: string;
  scraped_at: string;
  created_at: string;
  updated_at: string;
}

interface ProductDetailModal {
  isOpen: boolean;
  product: MonitoredProduct | null;
  priceHistory: PriceHistory[];
  sellerHistory: SellerInfo[];
  activeTab: 'details' | 'pricing' | 'sellers';
}

const PriceMonitor = () => {
  const { toast } = useToast();
  const { playSuccess, playError } = useSoundSettings();
    const {
    state,
    updateMonitoredProducts,
    updatePriceHistory,
    setLoading,
    setMonitoring,
    toggleAddForm,
    toggleHistory,
    updateLastUpdated
  } = usePriceMonitor();

  const {
    monitoredProducts,
    priceHistory,
    isLoading,
    isMonitoring,
    showAddForm,
    showHistory,
    lastUpdated
  } = state;

  const [sellerInfo, setSellerInfo] = useState<SellerInfo[]>([]);
  
  // Product detail modal state
  const [productDetailModal, setProductDetailModal] = useState<ProductDetailModal>({
    isOpen: false,
    product: null,
    priceHistory: [],
    sellerHistory: [],
    activeTab: 'details'
  });
  
  // Form state
  const [newProduct, setNewProduct] = useState({
    asin: '',
    region: 'eg',
    scrapeInterval: 60, // 1 hour default
    alertThreshold: 5, // 5% default
    isActive: true
  });

  // Selected account state
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // Multiple products state
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);

  // Bulk edit state
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkEditModal, setBulkEditModal] = useState({
    isOpen: false,
    newInterval: 60, // default 1 hour
    newThreshold: 5, // default 5%
    newStatus: true // default active
  });

  // Load monitored products on component mount
  useEffect(() => {
    loadMonitoredProducts();
    loadPriceHistory();
    loadSellerInfo();
    checkMonitoringStatus();
  }, []);

  // مراقبة تغييرات modal state
  useEffect(() => {
    console.log('🎯 Modal state changed:', productDetailModal);
  }, [productDetailModal]);

  // Check monitoring status
  const checkMonitoringStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/price-monitor/status`);
      const result = await response.json();
      
      if (result.success) {
        setMonitoring(result.data.isRunning);
      }
    } catch (error) {
      console.error('Error checking monitoring status:', error);
    }
  };

  // Auto-refresh data every 3 seconds for instant updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadMonitoredProducts();
      loadPriceHistory();
      loadSellerInfo();
    }, 3000); // 3 seconds for instant updates

    return () => clearInterval(interval);
  }, []); // Remove isMonitoring dependency to always refresh

  const loadMonitoredProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_monitor_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      updateMonitoredProducts(data || []);
      updateLastUpdated();
    } catch (error) {
      console.error('Error loading monitored products:', error);
      toast({
        title: "Error",
        description: "Failed to load monitored products",
        variant: "destructive",
      });
    }
  };

  const loadPriceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      updatePriceHistory(data || []);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const loadSellerInfo = async () => {
    try {
      console.log('🔄 Loading seller info...');
      
      // إضافة timeout للـ fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/seller-info/all`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('📊 Seller info loaded:', result.data?.length || 0, 'records');
        console.log('📊 Seller info data:', result.data);
        setSellerInfo(result.data || []);
      } else {
        console.error('❌ Failed to load seller info:', result.error);
        setSellerInfo([]); // تعيين مصفوفة فارغة في حالة الفشل
      }
    } catch (error) {
      console.error('❌ Error loading seller info:', error);
      setSellerInfo([]); // تعيين مصفوفة فارغة في حالة الخطأ
      
      // عرض رسالة خطأ للمستخدم
      toast({
        title: "Warning",
        description: "Failed to load seller information. Some features may be limited.",
        variant: "destructive",
      });
    }
  };

  // دالة لسحب المنتج مباشرة
  const scrapeProductImmediately = async (asin: string, region: string) => {
    try {
      console.log(`🔄 Scraping product immediately: ${asin} (${region})`);
      console.log(`👁️ Browser will open for ${asin} - you should see it!`);
      
      // إضافة timeout للـ fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout for scraping
      
      // Use the enhanced scraper from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/scrape-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: asin,
          region: region
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const scrapeResult = await response.json();
      console.log('🔍 Raw scrape result:', scrapeResult);

      if (!scrapeResult.success) {
        throw new Error(`Failed to scrape product: ${scrapeResult.error}`);
      }

      const result = {
        success: true,
        price: scrapeResult.price || 'N/A',
        title: scrapeResult.title || 'N/A',
        sellerName: scrapeResult.sellerName || 'N/A',
        sellerId: scrapeResult.sellerId || 'N/A',
        hasBuybox: scrapeResult.hasBuybox || false,
        buyboxPrice: scrapeResult.buyboxPrice || null,
        totalOffers: scrapeResult.totalOffers || 0
      };
      
      console.log('🔍 Processed result:', result);
      return result;

    } catch (error) {
      console.error(`❌ Error scraping product ${asin}:`, error);
      
      // عرض رسالة خطأ للمستخدم
      toast({
        title: "Scraping Error",
        description: `Failed to scrape ${asin}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape product'
      };
    }
  };

  const addProductToMonitor = async () => {
    if (!newProduct.asin.trim()) {
      toast({
        title: "Error",
        description: "Please enter valid ASINs",
        variant: "destructive",
      });
      return;
    }

    // Parse ASINs from text
    const asinLines = newProduct.asin
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Extract ASIN from line (could be just ASIN or ASIN with description)
        const asinMatch = line.match(/[A-Z0-9]{10}/);
        return asinMatch ? asinMatch[0] : line;
      })
      .filter(asin => asin.length === 10);

    if (asinLines.length === 0) {
      toast({
        title: "Error",
        description: "No valid ASINs found. Each ASIN must be exactly 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setIsAddingMultiple(true);

    try {
      toast({
        title: "Adding Products",
        description: `Adding ${asinLines.length} products... Each product will appear immediately after scraping!`,
        duration: 3000,
      });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < asinLines.length; i++) {
        const asin = asinLines[i];
        
        try {
          // Show progress
          toast({
            title: "Processing",
            description: `Processing ${asin} (${i + 1}/${asinLines.length})`,
            duration: 1000,
          });

          // Use the new endpoint that adds product immediately after scraping
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/add-product-immediately`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              asin: asin.toUpperCase(),
              region: newProduct.region,
              scrapeInterval: newProduct.scrapeInterval,
              alertThreshold: newProduct.alertThreshold,
              selectedAccount: selectedAccount // Add selectedAccount to the body
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            successCount++;
            console.log(`✅ Product ${asin} added immediately:`, result.data);
            
            // Show success message for each product
            toast({
              title: result.isNew ? "Product Added" : "Product Updated",
              description: `${asin} - ${result.data.title || 'Unknown Product'}`,
              duration: 2000,
            });

            // Refresh the products list immediately after each addition
            await loadMonitoredProducts();
            await loadPriceHistory();
            await loadSellerInfo();
            updateLastUpdated();
            
          } else {
            errorCount++;
            console.error(`❌ Failed to add ${asin}:`, result.error);
            toast({
              title: "Error",
              description: `Failed to add ${asin}: ${result.error}`,
              variant: "destructive",
              duration: 3000,
            });
          }

          // Small delay between products
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing ${asin}:`, error);
          toast({
            title: "Error",
            description: `Error processing ${asin}: ${error.message}`,
            variant: "destructive",
            duration: 3000,
          });
        }
      }

      // Final summary
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Successfully added ${successCount} products${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
          duration: 5000,
        });
        playSuccess();
      } else {
        toast({
          title: "Error",
          description: "Failed to add any products",
          variant: "destructive",
          duration: 5000,
        });
        playError();
      }

      // Clear form
      setNewProduct({
        asin: '',
        region: 'eg',
        scrapeInterval: 60,
        alertThreshold: 5,
        isActive: true
      });

    } catch (error) {
      console.error('Error adding products:', error);
      toast({
        title: "Error",
        description: "Failed to add products",
        variant: "destructive",
      });
      playError();
    } finally {
      setLoading(false);
      setIsAddingMultiple(false);
    }
  };



  const toggleProductMonitoring = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_monitor_products')
        .update({ is_active: isActive })
        .eq('id', productId);

      if (error) throw error;

      updateMonitoredProducts(
        monitoredProducts.map(product =>
          product.id === productId ? { ...product, is_active: isActive } : product
        )
      );

      toast({
        title: "Updated",
        description: `Monitoring ${isActive ? 'enabled' : 'disabled'} for product`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('price_monitor_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      updateMonitoredProducts(monitoredProducts.filter(product => product.id !== productId));

      toast({
        title: "Deleted",
        description: "Product removed from monitoring",
        duration: 2000,
      });
      playSuccess();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const startMonitoring = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/price-monitor/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setMonitoring(true);
        toast({
          title: "Monitoring Started",
          description: "Price monitoring is now active with automatic updates",
          duration: 3000,
        });
        playSuccess();
        
        // Run initial cycle immediately
        await runMonitoringCycle();
        
        // Set up auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
          if (isMonitoring) {
            loadMonitoredProducts();
            loadPriceHistory();
            updateLastUpdated();
          }
        }, 30 * 1000); // 30 seconds
        
        // Store interval ID for cleanup
        (window as any).monitoringInterval = refreshInterval;
        
      } else {
        throw new Error(result.error || 'Failed to start monitoring');
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to start price monitoring",
        variant: "destructive",
      });
      playError();
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/price-monitor/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setMonitoring(false);
        
        // Clear the auto-refresh interval
        if ((window as any).monitoringInterval) {
          clearInterval((window as any).monitoringInterval);
          (window as any).monitoringInterval = null;
        }
        
        toast({
          title: "Monitoring Stopped",
          description: "Price monitoring has been stopped",
          duration: 3000,
        });
        playSuccess();
      } else {
        throw new Error(result.error || 'Failed to stop monitoring');
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to stop price monitoring",
        variant: "destructive",
      });
      playError();
    } finally {
      setLoading(false);
    }
  };

  const runMonitoringCycle = async () => {
    try {
      console.log('🔄 Run Now button clicked - will open visible browser!');
      
      toast({
        title: "Starting Manual Scraping",
        description: "Browser will open and start scraping all products...",
        duration: 3000,
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/price-monitor/run-cycle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Manual monitoring cycle completed:', result.data);
        
        toast({
          title: "Manual Scraping Completed",
          description: `Processed ${result.data.processed} products successfully`,
          duration: 5000,
        });
        playSuccess();
        
        // Refresh the products list immediately
        await loadMonitoredProducts();
        await loadPriceHistory();
        await loadSellerInfo();
        updateLastUpdated();
      } else {
        throw new Error(result.error || 'Failed to run monitoring cycle');
      }
    } catch (error) {
      console.error('❌ Error running monitoring cycle:', error);
      
      toast({
        title: "Manual Scraping Failed",
        description: error.message || "Failed to run monitoring cycle",
        duration: 5000,
      });
      playError();
    }
  };



  const exportMonitoringData = async () => {
    try {
      setLoading(true);
      
      // جلب كل البيانات من Supabase
      const { data: allPriceHistory, error: priceHistoryError } = await supabase
        .from('price_history')
        .select('*')
        .order('scraped_at', { ascending: false });

      const { data: allSellerHistory, error: sellerHistoryError } = await supabase
        .from('seller_history')
        .select('*')
        .order('scraped_at', { ascending: false });

      if (priceHistoryError || sellerHistoryError) {
        console.error('Error fetching history data:', { priceHistoryError, sellerHistoryError });
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        monitoringStatus: {
          isActive: isMonitoring,
          lastUpdated: lastUpdated,
          totalProducts: monitoredProducts.length,
          activeProducts: monitoredProducts.filter(p => p.is_active).length,
          dueNowProducts: monitoredProducts.filter(p => {
            const nextScrape = new Date(p.next_scrape);
            const now = new Date();
            return nextScrape <= now;
          }).length
        },
        products: monitoredProducts.map(product => {
          // جلب تاريخ الأسعار للمنتج
          const productPriceHistory = allPriceHistory?.filter(h => h.product_id === product.id) || [];
          const productSellerHistory = allSellerHistory?.filter(s => s.product_id === product.id) || [];
          
          return {
            'ASIN': product.asin,
            'Title': product.title || 'N/A',
            'Image URL': product.image_url || 'N/A',
            'Current Price': product.current_price || 'N/A',
            'Previous Price': product.previous_price || 'N/A',
            'Price Change': product.price_change || 'N/A',
            'Price Change %': product.price_change_percent ? `${product.price_change_percent}%` : 'N/A',
            'Current Seller': product.seller_name || 'N/A',
            'Current Buy Box': product.has_buybox ? 'Yes' : 'No',
            'Current Total Offers': product.total_offers || 'N/A',
            'Region': product.region.toUpperCase(),
            'Status': product.is_active ? 'Active' : 'Inactive',
            'Last Scraped': new Date(product.last_scraped).toLocaleString(),
            'Next Scrape': new Date(product.next_scrape).toLocaleString(),
            'Scrape Interval': `${product.scrape_interval} minutes`,
            'Alert Threshold': product.alert_threshold ? `${product.alert_threshold}%` : 'N/A',
            'Created': new Date(product.created_at).toLocaleString(),
            'Updated': new Date(product.updated_at).toLocaleString(),
            'Price History Count': productPriceHistory.length,
            'Seller History Count': productSellerHistory.length
          };
        }).filter(product => product['Current Price'] !== 'N/A'), // Filter out products with no price
        priceHistory: allPriceHistory?.map(record => ({
          'Product ID': record.product_id,
          'ASIN': record.asin,
          'Price': record.price,
          'Price Display': record.price_display || 'N/A',
          'Region': record.region,
          'Scraped At': new Date(record.scraped_at).toLocaleString()
        })) || [],
        sellerHistory: allSellerHistory?.map(record => ({
          'Product ID': record.product_id,
          'ASIN': record.asin,
          'Seller Name': record.seller_name,
          'Seller ID': record.seller_id || 'N/A',
          'Has Buy Box': record.has_buybox ? 'Yes' : 'No',
          'Buy Box Price': record.buybox_price || 'N/A',
          'Total Offers': record.total_offers || 'N/A',
          'Region': record.region,
          'Scraped At': new Date(record.scraped_at).toLocaleString()
        })) || []
      };

      // إنشاء ملف Excel شامل
      const workbook = new ExcelJS.Workbook();
      
      // Sheet 1: Products Summary
      const productsSheet = workbook.addWorksheet('Products Summary');
      productsSheet.columns = [
        { header: 'ASIN', key: 'ASIN', width: 15 },
        { header: 'Title', key: 'Title', width: 40 },
        { header: 'Current Price', key: 'Current Price', width: 15 },
        { header: 'Price Change %', key: 'Price Change %', width: 15 },
        { header: 'Current Seller', key: 'Current Seller', width: 20 },
        { header: 'Buy Box', key: 'Current Buy Box', width: 10 },
        { header: 'Status', key: 'Status', width: 10 },
        { header: 'Region', key: 'Region', width: 10 },
        { header: 'Last Scraped', key: 'Last Scraped', width: 20 },
        { header: 'Next Scrape', key: 'Next Scrape', width: 20 }
      ];
      exportData.products.forEach(product => {
        productsSheet.addRow(product);
      });

      // Sheet 2: Price History
      const priceHistorySheet = workbook.addWorksheet('Price History');
      priceHistorySheet.columns = [
        { header: 'ASIN', key: 'ASIN', width: 15 },
        { header: 'Price', key: 'Price', width: 15 },
        { header: 'Price Display', key: 'Price Display', width: 20 },
        { header: 'Region', key: 'Region', width: 10 },
        { header: 'Scraped At', key: 'Scraped At', width: 20 }
      ];
      exportData.priceHistory.forEach(record => {
        priceHistorySheet.addRow(record);
      });

      // Sheet 3: Seller History
      const sellerHistorySheet = workbook.addWorksheet('Seller History');
      sellerHistorySheet.columns = [
        { header: 'ASIN', key: 'ASIN', width: 15 },
        { header: 'Seller Name', key: 'Seller Name', width: 25 },
        { header: 'Has Buy Box', key: 'Has Buy Box', width: 12 },
        { header: 'Buy Box Price', key: 'Buy Box Price', width: 15 },
        { header: 'Total Offers', key: 'Total Offers', width: 15 },
        { header: 'Region', key: 'Region', width: 10 },
        { header: 'Scraped At', key: 'Scraped At', width: 20 }
      ];
      exportData.sellerHistory.forEach(record => {
        sellerHistorySheet.addRow(record);
      });

      // Sheet 4: Summary
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
      ];
      summarySheet.addRows([
        { metric: 'Export Date', value: new Date().toLocaleString() },
        { metric: 'Monitoring Status', value: exportData.monitoringStatus.isActive ? 'Active' : 'Inactive' },
        { metric: 'Total Products', value: exportData.monitoringStatus.totalProducts },
        { metric: 'Active Products', value: exportData.monitoringStatus.activeProducts },
        { metric: 'Due Now Products', value: exportData.monitoringStatus.dueNowProducts },
        { metric: 'Total Price Records', value: exportData.priceHistory.length },
        { metric: 'Total Seller Records', value: exportData.sellerHistory.length },
        { metric: 'Last Updated', value: exportData.monitoringStatus.lastUpdated }
      ]);

      // حفظ الملف
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `price_monitor_complete_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLoading(false);
      toast({
        title: "Export Successful",
        description: `Exported complete data: ${exportData.products.length} products, ${exportData.priceHistory.length} price records, ${exportData.sellerHistory.length} seller records`,
        variant: "default",
      });
      playSuccess();
    } catch (error) {
      setLoading(false);
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export monitoring data",
        variant: "destructive",
      });
      playError();
    }
  };

  const getPriceChangeColor = (change: number | null) => {
    if (!change) return 'text-gray-400';
    return change > 0 ? 'text-error' : change < 0 ? 'text-success' : 'text-gray-400';
  };

  const getPriceChangeIcon = (change: number | null) => {
    if (!change) return null;
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getSellerInfo = (asin: string) => {
    // أولاً: ابحث في sellerInfo
    const sellerFromInfo = sellerInfo.find(seller => seller.asin === asin);
    if (sellerFromInfo) return sellerFromInfo;
    
    // ثانياً: ابحث في monitoredProducts
    const product = monitoredProducts.find(p => p.asin === asin);
    if (product && (product.seller_name || product.has_buybox)) {
      return {
        seller_name: product.seller_name,
        seller_id: product.seller_id,
        has_buybox: product.has_buybox,
        buybox_price: product.buybox_price,
        total_offers: product.total_offers
      };
    }
    
    return null;
  };

  const formatTimeUntilNextScrape = (nextScrape: string) => {
    const now = new Date();
    const next = new Date(nextScrape);
    const diff = next.getTime() - now.getTime();
    
    // إذا كان الوقت قد انتهى أو في غضون دقيقة واحدة
    if (diff <= 60000) return 'Due now';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // دالة فتح تفاصيل المنتج
  const openProductDetails = async (product: MonitoredProduct) => {
    console.log('🔍 Opening product details for:', product.asin);
    console.log('🔍 Product data:', product);
    
    try {
      // جلب تاريخ الأسعار للمنتج
      const { data: priceHistoryData, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', product.id)
        .order('scraped_at', { ascending: false })
        .limit(20);

      if (priceError) {
        console.error('Error loading price history:', priceError);
      } else {
        console.log('📊 Price history loaded:', priceHistoryData?.length || 0, 'records');
      }

      // جلب تاريخ السيلرز للمنتج
      const { data: sellerHistoryData, error: sellerError } = await supabase
        .from('seller_history')
        .select('*')
        .eq('product_id', product.id)
        .order('scraped_at', { ascending: false })
        .limit(20);

      if (sellerError) {
        console.error('Error loading seller history:', sellerError);
      } else {
        console.log('🏪 Seller history loaded:', sellerHistoryData?.length || 0, 'records');
      }

      const modalState = {
        isOpen: true,
        product,
        priceHistory: priceHistoryData || [],
        sellerHistory: sellerHistoryData || [],
        activeTab: 'details' as const
      };

      console.log('📊 Setting modal state:', modalState);
      console.log('📊 Modal state before setState:', productDetailModal);

      setProductDetailModal(modalState);
      
      console.log('📊 Modal state after setState should be updated');
    } catch (error) {
      console.error('Error opening product details:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  // دالة إغلاق تفاصيل المنتج
  const closeProductDetails = () => {
    setProductDetailModal({
      isOpen: false,
      product: null,
      priceHistory: [],
      sellerHistory: [],
      activeTab: 'details'
    });
  };

  // دالة تغيير التاب
  const setActiveTab = (tab: 'details' | 'pricing' | 'sellers') => {
    setProductDetailModal(prev => ({
      ...prev,
      activeTab: tab
    }));
  };

  // دالة تبديل وضع التحديد المتعدد
  const toggleBulkEditMode = () => {
    setIsBulkEditMode(!isBulkEditMode);
    if (isBulkEditMode) {
      setSelectedProducts([]);
    }
  };

  // دالة تحديد/إلغاء تحديد منتج
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // دالة تحديد جميع المنتجات
  const selectAllProducts = () => {
    setSelectedProducts(monitoredProducts.map(product => product.id));
  };

  // دالة إلغاء تحديد جميع المنتجات
  const deselectAllProducts = () => {
    setSelectedProducts([]);
  };

  // دالة فتح modal التعديل المتعدد
  const openBulkEditModal = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "❌ Error",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }
    setBulkEditModal(prev => ({ ...prev, isOpen: true }));
  };

  // دالة إغلاق modal التعديل المتعدد
  const closeBulkEditModal = () => {
    setBulkEditModal(prev => ({ ...prev, isOpen: false }));
  };

  // دالة تطبيق التعديلات المتعددة
  const applyBulkEdit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "❌ Error",
        description: "No products selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // تحديث المنتجات المحددة
      const { error } = await supabase
        .from('price_monitor_products')
        .update({
          scrape_interval: bulkEditModal.newInterval,
          alert_threshold: bulkEditModal.newThreshold,
          is_active: bulkEditModal.newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedProducts);

      if (error) {
        console.error('Error updating products:', error);
        toast({
          title: "❌ Error",
          description: "Failed to update products",
          variant: "destructive",
        });
        return;
      }

      // تحديث القائمة المحلية
      const updatedProducts = monitoredProducts.map(product => 
        selectedProducts.includes(product.id)
          ? {
              ...product,
              scrape_interval: bulkEditModal.newInterval,
              alert_threshold: bulkEditModal.newThreshold,
              is_active: bulkEditModal.newStatus,
              updated_at: new Date().toISOString()
            }
          : product
      );
      updateMonitoredProducts(updatedProducts);

              toast({
          title: "✅ Updated",
          description: `Successfully updated ${selectedProducts.length} products`,
        });

      playSuccess();
      closeBulkEditModal();
      setSelectedProducts([]);
      setIsBulkEditMode(false);
      
    } catch (error) {
      console.error('Error applying bulk edit:', error);
      toast({
        title: "❌ Error",
        description: "An error occurred while updating products",
        variant: "destructive",
      });
      playError();
    } finally {
      setLoading(false);
    }
  };

  // دالة حذف المنتجات المحددة
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "❌ Error",
        description: "No products selected for deletion",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('price_monitor_products')
        .delete()
        .in('id', selectedProducts);

      if (error) {
        console.error('Error deleting products:', error);
        toast({
          title: "❌ Error",
          description: "Failed to delete products",
          variant: "destructive",
        });
        return;
      }

      // تحديث القائمة المحلية
      const updatedProducts = monitoredProducts.filter(product => 
        !selectedProducts.includes(product.id)
      );
      updateMonitoredProducts(updatedProducts);

      toast({
        title: "✅ Deleted",
        description: `Successfully deleted ${selectedProducts.length} products`,
      });

      playSuccess();
      setSelectedProducts([]);
      setIsBulkEditMode(false);
      
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "❌ Error",
        description: "An error occurred while deleting products",
        variant: "destructive",
      });
      playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-2 sm:p-4 md:p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFFFFF] font-inter flex items-center gap-2 sm:gap-3">
              <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF7A00]" />
              Price Monitor
            </h1>
            <p className="text-sm sm:text-base text-[#E0E0E0]/80 mt-2">
              Monitor product prices automatically with recurring scraping
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => toggleAddForm(!showAddForm)}
              className="bg-[#FF7A00] hover:bg-[#ff9100] text-white h-9 sm:h-10"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add Product
            </Button>
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="h-9 sm:h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  {isMonitoring ? 'Stopping...' : 'Starting...'}
                </>
              ) : isMonitoring ? (
                <>
                  <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
            <Button
              onClick={runMonitoringCycle}
              variant="outline"
              className="h-9 sm:h-10"
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Run Now
            </Button>
            <Button
              onClick={exportMonitoringData}
              variant="outline"
              className="border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A] h-9 sm:h-10"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={toggleBulkEditMode}
              variant={isBulkEditMode ? "default" : "outline"}
              className={`h-9 sm:h-10 ${isBulkEditMode ? 'bg-[#FF7A00] hover:bg-[#EA580C] text-white' : 'border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]'}`}
            >
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {isBulkEditMode ? 'Cancel Selection' : 'Bulk Edit'}
            </Button>
          </div>
        </div>

        {/* Bulk Edit Actions Bar */}
        {isBulkEditMode && (
          <Card className="dashboard-card border-[#FF7A00] bg-[#FF7A00]/10">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-[#FF7A00]" />
                    <span className="text-[#FFFFFF] font-medium">
                      {selectedProducts.length} products selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                                          <Button
                        onClick={selectAllProducts}
                        variant="outline"
                        size="sm"
                        className="border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={deselectAllProducts}
                        variant="outline"
                        size="sm"
                        className="border-[#A3A3A3] text-[#A3A3A3] hover:bg-[#A3A3A3] hover:text-white"
                      >
                        Deselect All
                      </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={openBulkEditModal}
                    className="bg-[#FF7A00] hover:bg-[#EA580C] text-white"
                    disabled={selectedProducts.length === 0}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                  <Button
                    onClick={deleteSelectedProducts}
                    variant="destructive"
                    disabled={selectedProducts.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <Card className="dashboard-card border-[#2A2A2A]">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-[#FFFFFF] text-base sm:text-lg">Add Product to Monitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[#E0E0E0] text-sm">My Account</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] h-10">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                      <SelectItem value="bareeq.home">👤 bareeq.home</SelectItem>
                      <SelectItem value="globed">👤 GLOBED</SelectItem>
                      <SelectItem value="tahoun">👤 Tahoun Mart</SelectItem>
                      <SelectItem value="aldwlyah">👤 Aldwlyah trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#E0E0E0] text-sm">Region</Label>
                  <Select value={newProduct.region} onValueChange={(value) => setNewProduct(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                      <SelectItem value="eg">🇪🇬 Egypt</SelectItem>
                      <SelectItem value="sa">🇸🇦 Saudi Arabia</SelectItem>
                      <SelectItem value="ae">🇦🇪 UAE</SelectItem>
                      <SelectItem value="com">🇺🇸 USA</SelectItem>
                      <SelectItem value="de">🇩🇪 Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[#E0E0E0] text-sm">Amazon ASIN</Label>
                  <Textarea
                    value={newProduct.asin}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, asin: e.target.value.toUpperCase() }))}
                    placeholder="Enter ASINs (one per line or separated by commas):
B08N5WRWNW
B09LH36816
B0BZ15MXRZ

Or with descriptions:
B08N5WRWNW - iPhone 12
B09LH36816 - Samsung Galaxy"
                    className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] min-h-[80px]"
                    rows={4}
                  />
                  <p className="text-xs text-[#A3A3A3]">
                    Enter one ASIN per line or separate by commas. Each ASIN must be exactly 10 characters.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#E0E0E0] text-sm">Scrape Interval (minutes)</Label>
                  <Select value={newProduct.scrapeInterval.toString()} onValueChange={(value) => setNewProduct(prev => ({ ...prev, scrapeInterval: parseInt(value) }))}>
                    <SelectTrigger className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#E0E0E0] text-sm">Alert Threshold (%)</Label>
                  <Input
                    type="number"
                    value={newProduct.alertThreshold}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                    className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] h-10"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newProduct.isActive}
                  onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="text-[#E0E0E0] text-sm">Active monitoring</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addProductToMonitor}
                  disabled={isLoading || !newProduct.asin.trim()}
                  className="bg-[#FF7A00] hover:bg-[#ff9100] text-white h-10"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isAddingMultiple ? 'Adding Multiple...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Monitor
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => toggleAddForm(false)}
                  variant="outline"
                  className="border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A] h-10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monitoring Status */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[#E0E0E0] text-sm sm:text-base">
                    Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {monitoredProducts.filter(p => p.status).length} Active Products
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {monitoredProducts.filter(p => p.status && new Date(p.next_scrape) <= new Date()).length} Due Now
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A3A3A3]">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Last updated: {lastUpdated}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitored Products Table */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-[#FFFFFF] flex items-center justify-between text-base sm:text-lg">
              <span>Monitored Products</span>
              <Button
                onClick={() => toggleHistory(!showHistory)}
                variant="ghost"
                size="sm"
                className="text-[#A3A3A3] hover:text-[#FFFFFF]"
              >
                {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]">
                    {isBulkEditMode && (
                      <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm w-12">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === monitoredProducts.length && monitoredProducts.length > 0}
                          onChange={(e) => e.target.checked ? selectAllProducts() : deselectAllProducts()}
                          className="w-4 h-4 text-[#FF7A00] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FF7A00] focus:ring-2"
                        />
                      </TableHead>
                    )}
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Current Price</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm hidden md:table-cell">Seller</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm hidden lg:table-cell">My Account</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm hidden lg:table-cell">Next Scrape</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm hidden xl:table-cell">Region</TableHead>
                    <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#A3A3A3]">
                        <div className="flex flex-col items-center gap-2">
                          <Monitor className="h-8 w-8 text-[#A3A3A3]" />
                          <p>No products being monitored</p>
                          <p className="text-xs">Add products to start price monitoring</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    monitoredProducts.map((product) => (
                      <TableRow key={product.id} className="border-[#2A2A2A]">
                        {isBulkEditMode && (
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="w-4 h-4 text-[#FF7A00] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FF7A00] focus:ring-2"
                            />
                          </TableCell>
                        )}
                        <TableCell className="py-3 sm:py-5">
                          <div 
                            className="flex items-center space-x-4 cursor-pointer hover:bg-[#2A2A2A]/50 rounded-lg p-3 transition-colors"
                            onClick={() => openProductDetails(product)}
                          >
                            {/* صورة المنتج - أكبر */}
                            <div className="flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.title || product.asin}
                                  className="w-16 h-16 object-cover rounded-lg border border-[#2A2A2A]"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              {!product.image_url && (
                                <div className="w-16 h-16 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                                  <Monitor className="w-8 h-8 text-[#A3A3A3]" />
                                </div>
                              )}
                            </div>
                            {/* معلومات المنتج - أكبر */}
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="font-mono text-[#FF7A00] text-sm sm:text-base font-bold">
                                {product.asin}
                              </div>
                              <div className="text-[#E0E0E0] text-sm sm:text-base truncate max-w-[200px] sm:max-w-[250px]">
                                {product.title || 'Loading...'}
                              </div>
                            </div>
                            {/* أيقونة الضغط */}
                            <div className="flex-shrink-0">
                              <Eye className="w-5 h-5 text-[#A3A3A3] hover:text-[#FF7A00] transition-colors" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.current_price || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {(() => {
                            const seller = getSellerInfo(product.asin);
                            return seller ? (
                              <div className="space-y-1">
                                <div className="text-[#E0E0E0] text-xs sm:text-sm font-medium truncate max-w-[120px]">
                                  {seller.seller_name}
                                </div>
                                <div className="flex items-center gap-1">
                                  {seller.has_buybox && (
                                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                      Buy Box
                                    </Badge>
                                  )}
                                  {seller.total_offers > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {seller.total_offers} offers
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[#A3A3A3] text-xs sm:text-sm">N/A</span>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-[#A3A3A3] text-xs sm:text-sm hidden lg:table-cell">
                          {(() => {
                            const seller = getSellerInfo(product.asin);
                            return seller ? (
                              <div className="text-[#E0E0E0] text-xs sm:text-sm">
                                {product.selected_account || 'N/A'}
                              </div>
                            ) : (
                              <span className="text-[#A3A3A3] text-xs sm:text-sm">N/A</span>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-[#A3A3A3] text-xs sm:text-sm hidden lg:table-cell">
                          {formatTimeUntilNextScrape(product.next_scrape)}
                        </TableCell>
                        <TableCell className="text-[#E0E0E0] text-xs sm:text-sm hidden xl:table-cell">
                          {product.region.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                              {/* Status Toggle */}
                              <DropdownMenuItem 
                                onClick={() => toggleProductMonitoring(product.id, !product.is_active)}
                                className="text-[#E0E0E0] hover:bg-[#2A2A2A] cursor-pointer"
                              >
                                <div className="flex items-center space-x-2">
                                  {product.is_active ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span>Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      <span>Inactive</span>
                                    </>
                                  )}
                                </div>
                              </DropdownMenuItem>
                              {/* Delete Product */}
                              <DropdownMenuItem 
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Price History */}
        {showHistory && (
          <Card className="dashboard-card border-[#2A2A2A]">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-[#FFFFFF] text-base sm:text-lg">Price History</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]">
                      <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">ASIN</TableHead>
                      <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Price</TableHead>
                      <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Region</TableHead>
                      <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm">Scraped At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.slice(0, 20).map((record) => (
                      <TableRow key={record.id} className="border-[#2A2A2A]">
                        <TableCell className="font-mono text-[#FF7A00] text-xs sm:text-sm">
                          {record.asin}
                        </TableCell>
                        <TableCell className="text-[#FF7A00] font-bold text-xs sm:text-sm">
                          ${record.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[#E0E0E0] text-xs sm:text-sm">
                          {record.region.toUpperCase()}
                        </TableCell>
                        <TableCell className="text-[#A3A3A3] text-xs sm:text-sm">
                          {new Date(record.scraped_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Detail Modal */}
        <Dialog open={productDetailModal.isOpen} onOpenChange={closeProductDetails}>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#FFFFFF] text-lg">Product Details</DialogTitle>
            </DialogHeader>
            
            {productDetailModal.product ? (
              <div className="space-y-4 text-[#FFFFFF]">
                <div className="text-lg font-bold">
                  ASIN: {productDetailModal.product.asin}
                </div>
                <div className="text-[#E0E0E0]">
                  Title: {productDetailModal.product.title || 'No title'}
                </div>
                <div className="text-[#FF7A00] text-xl font-bold">
                  Price: {productDetailModal.product.current_price || 'N/A'}
                </div>
                <div className="text-[#A3A3A3]">
                  Region: {productDetailModal.product.region}
                </div>
                <div className="text-[#A3A3A3]">
                  Status: {productDetailModal.product.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-[#A3A3A3]">
                  Price History: {productDetailModal.priceHistory.length} records
                </div>
                <div className="text-[#A3A3A3]">
                  Seller History: {productDetailModal.sellerHistory.length} records
                </div>
                <div className="text-[#A3A3A3]">
                  Modal Open: {productDetailModal.isOpen ? 'Yes' : 'No'}
                </div>
              </div>
            ) : (
              <div className="text-[#A3A3A3]">No product selected</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Modal */}
        <Dialog open={bulkEditModal.isOpen} onOpenChange={closeBulkEditModal}>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#FFFFFF] text-lg">Bulk Edit Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 text-[#FFFFFF]">
              <div className="space-y-2">
                <div className="text-[#E0E0E0] font-medium">
                  {selectedProducts.length} products selected
                </div>
                <div className="text-[#A3A3A3] text-sm">
                  The following settings will be applied to all selected products
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Scrape Interval */}
                <div className="space-y-2">
                  <Label className="text-[#E0E0E0] text-sm">Scrape Interval</Label>
                  <Select 
                    value={bulkEditModal.newInterval.toString()} 
                    onValueChange={(value) => setBulkEditModal(prev => ({ ...prev, newInterval: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-[#2A2A2A] border-[#404040] text-[#FFFFFF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#404040]">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert Threshold */}
                <div className="space-y-2">
                  <Label className="text-[#E0E0E0] text-sm">Alert Threshold (%)</Label>
                  <Input
                    type="number"
                    value={bulkEditModal.newThreshold}
                    onChange={(e) => setBulkEditModal(prev => ({ ...prev, newThreshold: parseInt(e.target.value) || 0 }))}
                    className="bg-[#2A2A2A] border-[#404040] text-[#FFFFFF]"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-[#E0E0E0] text-sm">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bulkStatus"
                      checked={bulkEditModal.newStatus}
                      onCheckedChange={(checked) => setBulkEditModal(prev => ({ ...prev, newStatus: checked }))}
                    />
                                <Label htmlFor="bulkStatus" className="text-[#E0E0E0] text-sm">
              {bulkEditModal.newStatus ? 'Active' : 'Inactive'}
            </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                                  <Button
                    variant="outline"
                    onClick={closeBulkEditModal}
                    className="border-[#404040] text-[#E0E0E0] hover:bg-[#2A2A2A]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={applyBulkEdit}
                    className="bg-[#FF7A00] hover:bg-[#EA580C] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Apply Changes'
                    )}
                  </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PriceMonitor; 