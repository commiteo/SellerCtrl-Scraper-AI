
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Package, Clock, Settings, TrendingUp, Database, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalScraped: 247,
    todayScraped: 12,
    successRate: 94.8,
    avgResponseTime: 2.3
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayScraped: prev.todayScraped + Math.floor(Math.random() * 2),
        totalScraped: prev.totalScraped + Math.floor(Math.random() * 2)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const recentActivity = [
    { asin: 'B08N5WRWNW', product: 'Echo Dot (4th Gen)', time: '2 minutes ago', status: 'success' },
    { asin: 'B0B7RFBVYX', product: 'iPhone 14 Pro Case', time: '5 minutes ago', status: 'success' },
    { asin: 'B09DFCB8Q4', product: 'Wireless Charger', time: '12 minutes ago', status: 'failed' },
    { asin: 'B08FBM7G5J', product: 'Gaming Mouse', time: '18 minutes ago', status: 'success' },
  ];

  const quickActions = [
    {
      title: 'Start Scraping',
      description: 'Extract product data using ASIN',
      icon: Search,
      action: () => navigate('/scraper'),
      color: 'bg-orange-600'
    },
    {
      title: 'View History',
      description: 'See all scraped products',
      icon: Clock,
      action: () => navigate('/history'),
      color: 'bg-orange-700'
    },
    {
      title: 'Configure Settings',
      description: 'Manage your preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-orange-800'
    }
  ];

  return (
    <div className="min-h-full bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Amazon Scraper
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your powerful tool for extracting Amazon product data. Monitor, analyze, and track product information with ease.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Scraped</p>
                  <p className="text-2xl font-bold text-white">{stats.totalScraped.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-white">{stats.todayScraped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-white">{stats.avgResponseTime}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${action.color} rounded-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                    <p className="text-gray-400">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{activity.product}</p>
                    <p className="text-gray-400 text-sm">ASIN: {activity.asin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className={activity.status === 'success' ? 'bg-orange-600' : ''}>
                    {activity.status}
                  </Badge>
                  <span className="text-gray-400 text-sm">{activity.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Get Started */}
        <Card className="bg-gradient-to-r from-orange-900 to-orange-800 border-orange-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Scraping?</h2>
            <p className="text-orange-100 mb-6">Enter an Amazon ASIN and get detailed product information in seconds.</p>
            <Button onClick={() => navigate('/scraper')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
              Start Scraping Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
