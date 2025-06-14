
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Activity, BarChart3, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const Home = () => {
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for metrics
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$1,250.00',
      change: '+12.5%',
      trend: 'up',
      description: 'Trending up this month',
      subtitle: 'Products scraped for last 6 months'
    },
    {
      title: 'New Products',
      value: '1,234',
      change: '-20%',
      trend: 'down',
      description: 'Down 20% this period',
      subtitle: 'Acquisition needs attention'
    },
    {
      title: 'Active Scrapers',
      value: '45,678',
      change: '+12.5%',
      trend: 'up',
      description: 'Strong user retention',
      subtitle: 'Engagement exceed targets'
    },
    {
      title: 'Success Rate',
      value: '4.5%',
      change: '+4.5%',
      trend: 'up',
      description: 'Steady performance increase',
      subtitle: 'Meets growth projections'
    }
  ];

  // Mock chart data
  const chartData = [
    { date: 'Apr 6', value: 120 },
    { date: 'Apr 12', value: 280 },
    { date: 'Apr 18', value: 180 },
    { date: 'Apr 24', value: 420 },
    { date: 'Apr 30', value: 350 },
    { date: 'May 6', value: 480 },
    { date: 'May 12', value: 320 },
    { date: 'May 18', value: 560 },
    { date: 'May 24', value: 420 },
    { date: 'May 30', value: 650 },
    { date: 'Jun 5', value: 580 },
    { date: 'Jun 11', value: 720 },
    { date: 'Jun 17', value: 680 },
    { date: 'Jun 23', value: 780 },
    { date: 'Jun 30', value: 850 }
  ];

  // Mock table data
  const tableData = [
    { id: 1, header: 'Cover page', sectionType: 'Cover page', status: 'In Process', target: 18, limit: 5, reviewer: 'Eddie Lake' },
    { id: 2, header: 'Table of contents', sectionType: 'Table of contents', status: 'Done', target: 29, limit: 24, reviewer: 'Eddie Lake' },
    { id: 3, header: 'Executive summary', sectionType: 'Narrative', status: 'Done', target: 10, limit: 13, reviewer: 'Eddie Lake' },
    { id: 4, header: 'Technical approach', sectionType: 'Narrative', status: 'Done', target: 27, limit: 23, reviewer: 'Jamie Tashputukov' },
    { id: 5, header: 'Design', sectionType: 'Narrative', status: 'In Process', target: 2, limit: 16, reviewer: 'Jamie Tashputukov' },
    { id: 6, header: 'Capabilities', sectionType: 'Narrative', status: 'In Process', target: 20, limit: 8, reviewer: 'Jamie Tashputukov' },
    { id: 7, header: 'Integration with existing systems', sectionType: 'Narrative', status: 'In Process', target: 19, limit: 21, reviewer: 'Jamie Tashputukov' },
    { id: 8, header: 'Innovation and Advantages', sectionType: 'Narrative', status: 'Done', target: 25, limit: 26, reviewer: 'Assign review...' },
    { id: 9, header: 'Overview of BMFs Innovative Solutions', sectionType: 'Technical content', status: 'Done', target: 7, limit: 23, reviewer: 'Assign review...' },
    { id: 10, header: 'Advanced Algorithms and Machine Learning', sectionType: 'Narrative', status: 'Done', target: 30, limit: 28, reviewer: 'Assign review...' }
  ];

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-full bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Monitor your scraping performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              {timeFilter}
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                  <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-green-500 text-sm font-medium mb-1">{metric.description}</p>
                <p className="text-gray-500 text-xs">{metric.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Total Visitors</CardTitle>
              <p className="text-gray-400 text-sm">Data for the last 3 months</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                Last 3 months
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                Last 7 days
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#F97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700">
                Outline
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Past Performance
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Key Personnel
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Focus Documents
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                Customize Columns
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                + Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300">Header</TableHead>
                  <TableHead className="text-gray-300">Section Type</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Target</TableHead>
                  <TableHead className="text-gray-300">Limit</TableHead>
                  <TableHead className="text-gray-300">Reviewer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="text-white">{item.header}</TableCell>
                    <TableCell className="text-gray-300">{item.sectionType}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.status === 'Done' ? 'default' : 'secondary'}
                        className={item.status === 'Done' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{item.target}</TableCell>
                    <TableCell className="text-gray-300">{item.limit}</TableCell>
                    <TableCell className="text-blue-400">{item.reviewer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-400 text-sm">
                0 of 55 row(s) selected.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Rows per page</span>
                  <select className="bg-gray-800 border-gray-600 text-white rounded px-2 py-1 text-sm">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
                <span className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</span>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer text-white hover:bg-gray-700'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer text-white hover:bg-gray-700'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
