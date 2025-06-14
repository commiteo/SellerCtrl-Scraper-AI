
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Package, Clock, Settings, TrendingUp, Database, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    totalScraped: 0,
    todayScraped: 0,
    successRate: 0,
    avgResponseTime: 0
  });

  const recentActivity: { asin: string; product: string; time: string; status: string }[] = [];

  const quickActions = [
    {
      title: 'Start Scraping',
      description: 'Extract product data using ASIN',
      icon: Search,
      action: () => navigate('/scraper'),
      color: 'bg-[#EB5F01]'
    },
    {
      title: 'View History',
      description: 'See all scraped products',
      icon: Clock,
      action: () => navigate('/history'),
      color: 'bg-[#D35400]'
    },
    {
      title: 'Configure Settings',
      description: 'Manage your preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-[#B8460E]'
    }
  ];

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#FFFFFF] font-inter">
            Welcome to Amazon Scraper
          </h1>
          <p className="text-xl text-[#E0E0E0]/80 max-w-3xl mx-auto font-inter">
            Your powerful tool for extracting Amazon product data. Monitor, analyze, and track product information with ease.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF7A00] rounded-lg">
                  <Package className="h-6 w-6 text-[#FFFFFF]" />
                </div>
                <div>
                  <p className="text-[#A3A3A3] text-sm">Total Scraped</p>
                  <p className="text-2xl font-bold text-[#FFFFFF]">{stats.totalScraped.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF7A00] rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#FFFFFF]" />
                </div>
                <div>
                  <p className="text-[#A3A3A3] text-sm">Today</p>
                  <p className="text-2xl font-bold text-[#FFFFFF]">{stats.todayScraped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF7A00] rounded-lg">
                  <Database className="h-6 w-6 text-[#FFFFFF]" />
                </div>
                <div>
                  <p className="text-[#A3A3A3] text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-[#FFFFFF]">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF7A00] rounded-lg">
                  <Zap className="h-6 w-6 text-[#FFFFFF]" />
                </div>
                <div>
                  <p className="text-[#A3A3A3] text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-[#FFFFFF]">{stats.avgResponseTime}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="dashboard-card hover:shadow-xl cursor-pointer transition-shadow" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${action.color} rounded-lg`}>
                    <action.icon className="h-6 w-6 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFFFFF] font-inter">{action.title}</h3>
                    <p className="text-[#E0E0E0]/80">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2 font-inter">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-center text-sm text-[#A3A3A3]">No recent activity.</p>
            )}
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-[#A3A3A3]" />
                  <div>
                    <p className="text-[#E0E0E0] font-medium font-inter">{activity.product}</p>
                    <p className="text-[#A3A3A3] text-sm">ASIN: {activity.asin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className={activity.status === 'success' ? 'bg-[#FF7A00] text-[#FFFFFF]' : ''}>
                    {activity.status}
                  </Badge>
                  <span className="text-[#A3A3A3] text-sm">{activity.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Get Started */}
        <Card className="bg-gradient-to-r from-[#FF7A00] to-[#FF6A00] border-[#FF7A00] rounded-2xl shadow-dashboard">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4 font-inter">Ready to Start Scraping?</h2>
            <p className="text-[#FFFFFF]/90 mb-6 font-inter">Enter an Amazon ASIN and get detailed product information in seconds.</p>
            <Button onClick={() => navigate('/scraper')} className="btn-glow px-8 py-3 text-lg font-inter">
              Start Scraping Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

