import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAdvancedState } from "@/contexts/AdvancedStateContext";

interface PerformanceMetrics {
  totalScrapes: number;
  successfulScrapes: number;
  successRate: number;
  dailyStats: Record<string, any>;
  dataSourceStats: Record<string, any>;
  errorAnalysis: Record<string, number>;
  period: string;
}

interface PriceAnalysis {
  totalPriceRecords: number;
  priceChanges: {
    increases: number;
    decreases: number;
    noChange: number;
    averageChange: number;
  };
  volatility: Record<string, any>;
  topPerformers: any[];
  period: string;
}

interface CompetitorAnalysis {
  totalSellerRecords: number;
  competitorStats: any[];
  buyBoxAnalysis: {
    totalRecords: number;
    buyBoxWins: number;
    buyBoxRate: number;
    topBuyBoxSellers: any[];
  };
  topCompetitors: any[];
  period: string;
}

const Analytics = () => {
  const { toast } = useToast();
  const { actions } = useAdvancedState();
  const [loading, setLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load performance metrics
      const perfResponse = await fetch(`/api/analytics/performance?days=${selectedPeriod}`);
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        setPerformanceMetrics(perfData);
      }

      // Load price analysis
      const priceResponse = await fetch(`/api/analytics/price-analysis?days=${selectedPeriod * 4}`);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        setPriceAnalysis(priceData);
      }

      // Load competitor analysis
      const compResponse = await fetch(`/api/analytics/competitor-analysis?days=${selectedPeriod}`);
      if (compResponse.ok) {
        const compData = await compResponse.json();
        setCompetitorAnalysis(compData);
      }

      toast({
        title: "✅ Analytics loaded successfully",
        description: `Data for the last ${selectedPeriod} days has been loaded.`,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "❌ Error loading analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Comprehensive insights into your scraping performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button 
            onClick={loadAnalytics} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Scrapes</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(performanceMetrics.totalScrapes)}
              </div>
              <p className="text-xs text-gray-400">
                Last {selectedPeriod} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getSuccessRateColor(performanceMetrics.successRate)}`}>
                {formatPercentage(performanceMetrics.successRate)}
              </div>
              <p className="text-xs text-gray-400">
                {performanceMetrics.successfulScrapes} successful
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Data Sources</CardTitle>
              <BarChart className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Object.keys(performanceMetrics.dataSourceStats).length}
              </div>
              <p className="text-xs text-gray-400">
                Active sources
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Object.keys(performanceMetrics.errorAnalysis).length}
              </div>
              <p className="text-xs text-gray-400">
                Error types
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
            <Activity className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="competitors" className="data-[state=active]:bg-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Competitors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {performanceMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Source Performance */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Source Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(performanceMetrics.dataSourceStats).map(([source, stats]: [string, any]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{source}</p>
                          <p className="text-gray-400 text-sm">
                            {stats.total} total, {stats.successful} successful
                          </p>
                        </div>
                        <Badge variant={stats.successRate > 80 ? "default" : "destructive"}>
                          {formatPercentage(stats.successRate)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Error Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(performanceMetrics.errorAnalysis).map(([error, count]: [string, number]) => (
                      <div key={error} className="flex items-center justify-between">
                        <p className="text-white text-sm truncate flex-1">{error}</p>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {priceAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Changes */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Price Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {formatNumber(priceAnalysis.priceChanges.increases)}
                      </div>
                      <p className="text-gray-400 text-sm">Increases</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {formatNumber(priceAnalysis.priceChanges.decreases)}
                      </div>
                      <p className="text-gray-400 text-sm">Decreases</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">
                        {formatNumber(priceAnalysis.priceChanges.noChange)}
                      </div>
                      <p className="text-gray-400 text-sm">No Change</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {priceAnalysis.priceChanges.averageChange.toFixed(2)}%
                      </div>
                      <p className="text-gray-400 text-sm">Avg Change</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Price Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {priceAnalysis.topPerformers.slice(0, 5).map((performer: any, index: number) => (
                      <div key={performer.asin} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                          <p className="text-white text-sm truncate">{performer.asin}</p>
                        </div>
                        <Badge variant={performer.change > 0 ? "default" : "destructive"}>
                          {performer.change.toFixed(2)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          {competitorAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buy Box Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Buy Box Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {formatNumber(competitorAnalysis.buyBoxAnalysis.buyBoxWins)}
                        </div>
                        <p className="text-gray-400 text-sm">Buy Box Wins</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {formatPercentage(competitorAnalysis.buyBoxAnalysis.buyBoxRate)}
                        </div>
                        <p className="text-gray-400 text-sm">Win Rate</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-white font-medium">Top Buy Box Sellers:</p>
                      {competitorAnalysis.buyBoxAnalysis.topBuyBoxSellers.slice(0, 3).map((seller: any) => (
                        <div key={seller.name} className="flex items-center justify-between">
                          <p className="text-gray-300 text-sm truncate">{seller.name}</p>
                          <Badge>{seller.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Competitors */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Competitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitorAnalysis.topCompetitors.slice(0, 5).map((competitor: any, index: number) => (
                      <div key={competitor.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                          <p className="text-white text-sm truncate">{competitor.name}</p>
                        </div>
                        <Badge>{competitor.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !performanceMetrics && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No analytics data available</p>
            <Button onClick={loadAnalytics} className="mt-4">
              Load Analytics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 