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
      { label: 'Total Submissions', value: dashboardData.totalSubmissions, color: '#22c55e', shortLabel: 'Total' },
      { label: 'Approved Submissions', value: dashboardData.approvedSubmissions, color: '#84cc16', shortLabel: 'Approved' },
      { label: 'Rejected Submissions', value: dashboardData.rejectedSubmissions, color: '#f59e0b', shortLabel: 'Rejected' },
      { label: 'Orders in Work', value: dashboardData.ordersInWork, color: '#3b82f6', shortLabel: 'In Work' },
      { label: 'Orders in QA', value: dashboardData.ordersInQA, color: '#8b5cf6', shortLabel: 'In QA' },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const roundedMax = Math.ceil(maxValue / 1000) * 1000; // Round up to nearest thousand
    const yAxisSteps = 5;
    const stepValue = roundedMax / yAxisSteps;

    if (chartData.every(item => item.value === 0)) {
      return (
        <div className="h-80 flex items-center justify-center bg-white rounded-lg border border-gray-200">
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
      <div className="relative bg-white border border-gray-200 rounded-lg p-6">
        {/* Chart Container */}
        <div className="relative h-80 flex">
          {/* Y-Axis */}
          <div className="w-16 flex flex-col justify-between text-xs text-gray-600 pr-2">
            {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
              <div key={i} className="text-right">
                {Math.round(stepValue * (yAxisSteps - i)).toLocaleString()}
              </div>
            ))}
          </div>

          {/* Chart Area with Grid */}
          <div className="flex-1 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0">
              {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${(i / yAxisSteps) * 100}%` }}
                />
              ))}
            </div>

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-center gap-8 px-4">
              {chartData.map((item, index) => {
                const height = roundedMax > 0 ? (item.value / roundedMax) * 100 : 0;
                const minHeight = item.value > 0 ? 2 : 0; // Minimum bar height for visibility

                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-shrink-0">
                    {/* Value label above bar */}
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      {item.value > 0 ? item.value.toLocaleString() : ''}
                    </div>

                    {/* Bar */}
                    <div
                      className="w-16 rounded-t transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: item.color,
                        height: `${Math.max(height, minHeight)}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    />

                    {/* Label below bar */}
                    <div className="text-xs font-medium text-gray-600 text-center w-16 leading-tight mt-2">
                      {item.shortLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-Axis Line */}
        <div className="ml-16 border-t border-gray-300 mt-2"></div>
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
          <p className="text-gray-600">Real-time visualization of your submissions and performance metrics</p>
        </div>

        {/* Chart Section */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-4 px-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Work categories / submissions by time
              </CardTitle>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last Day">Last Day</SelectItem>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Last Year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ModernBarChart data={dashboardData.categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
