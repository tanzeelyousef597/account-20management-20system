import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

interface DashboardData {
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  ordersInQA: number;
  ordersInWork: number;
  categories: { category: string; submissions: number }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('Last Month');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    ordersInQA: 0,
    ordersInWork: 0,
    categories: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter]);

  const fetchDashboardData = async () => {
    try {
      const endpoint = user?.role === 'Worker'
        ? `/api/dashboard/worker/${user.id}?filter=${encodeURIComponent(selectedFilter)}`
        : `/api/dashboard/data?filter=${encodeURIComponent(selectedFilter)}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    bgColor
  }: {
    icon: any,
    title: string,
    value: number,
    bgColor: string
  }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-white/80" />
      </div>
    </div>
  );

  const ModernBarChart = ({ data }: { data: { category: string; submissions: number }[] }) => {
    // Use dashboard metrics for the chart
    const chartData = [
      { label: 'Total Submissions', value: dashboardData.totalSubmissions, color: 'bg-red-500' },
      { label: 'Approved Submissions', value: dashboardData.approvedSubmissions, color: 'bg-orange-500' },
      { label: 'Rejected Submissions', value: dashboardData.rejectedSubmissions, color: 'bg-yellow-500' },
      { label: 'Orders in Work', value: dashboardData.ordersInWork, color: 'bg-green-500' },
      { label: 'Orders in QA', value: dashboardData.ordersInQA, color: 'bg-blue-500' },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    if (chartData.every(item => item.value === 0)) {
      return (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-sm text-gray-400">
              {user?.role === 'Admin'
                ? 'Data will appear when workers submit orders'
                : 'Submit work orders to see your progress'
              }
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-80 flex items-end justify-center gap-8 p-8 bg-gray-50 rounded-lg">
        {chartData.map((item, index) => {
          const height = (item.value / maxValue) * 240; // 240px max height
          const minHeight = item.value > 0 ? 20 : 0; // Minimum bar height for visibility

          return (
            <div key={index} className="flex flex-col items-center space-y-3">
              {/* Value label above bar */}
              <div className="text-sm font-semibold text-gray-700 min-h-5">
                {item.value > 0 ? item.value : ''}
              </div>

              {/* Bar */}
              <div
                className={`${item.color} rounded-t-lg transition-all duration-1000 ease-out shadow-lg min-w-16 w-16 hover:scale-105 hover:shadow-xl`}
                style={{
                  height: `${Math.max(height, minHeight)}px`,
                  animationDelay: `${index * 0.2}s`
                }}
              />

              {/* Label below bar */}
              <div className="text-xs font-medium text-gray-600 text-center max-w-16 leading-tight">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of submissions and performance</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <MetricCard
          icon={FileText}
          title="Total Submissions"
          value={dashboardData.totalSubmissions}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <MetricCard
          icon={CheckCircle}
          title="Approved Submissions"
          value={dashboardData.approvedSubmissions}
          bgColor="bg-gradient-to-br from-green-500 to-green-600"
        />
        <MetricCard
          icon={Clock}
          title="Orders in QA"
          value={dashboardData.ordersInQA}
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <MetricCard
          icon={XCircle}
          title="Rejected Submissions"
          value={dashboardData.rejectedSubmissions}
          bgColor="bg-gradient-to-br from-red-500 to-red-600"
        />
        <MetricCard
          icon={Clock}
          title={user?.role === 'Admin' ? "Orders in Work" : "Orders in Work"}
          value={dashboardData.ordersInWork}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Performance Analytics</h3>
          <p className="text-gray-600">Select a time period to view detailed metrics</p>
        </div>

        {/* Filter Controls */}
        <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 justify-center sm:justify-start">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Time Period:</span>
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48 md:w-60 bg-white border-blue-300 focus:border-blue-500 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last Day">📅 Last Day</SelectItem>
                  <SelectItem value="Last Week">📊 Last Week</SelectItem>
                  <SelectItem value="Last Month">📈 Last Month</SelectItem>
                  <SelectItem value="Last Year">📋 Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Dashboard Metrics Overview
            </CardTitle>
            <CardDescription className="text-gray-600">
              Real-time visualization of your key performance indicators for {selectedFilter.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-inner">
              <ModernBarChart data={dashboardData.categories} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
