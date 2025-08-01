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
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Overview of submissions and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = date.toISOString().slice(0, 7);
                const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Dashboard Metrics Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard Metrics Overview
          </CardTitle>
          <CardDescription>
            Visual breakdown of key performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModernBarChart data={dashboardData.categories} />
        </CardContent>
      </Card>
    </div>
  );
}
