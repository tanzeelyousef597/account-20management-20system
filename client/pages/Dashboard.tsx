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
    // Generate time periods based on selected filter
    const getTimePeriods = () => {
      switch (selectedFilter) {
        case 'Last Day':
          return Array.from({ length: 12 }, (_, i) => {
            const hour = (new Date().getHours() - 11 + i + 24) % 24;
            return `${hour}:00`;
          });
        case 'Last Week':
          return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        case 'Last Month':
          return Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
        case 'Last Year':
        default:
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      }
    };

    // Categories with real dashboard data - all 5 requested categories
    const categories = [
      { name: 'Total Submissions', color: '#8b5cf6', value: dashboardData.totalSubmissions, gradient: 'from-purple-500 to-purple-600' },
      { name: 'Approved Submissions', color: '#10b981', value: dashboardData.approvedSubmissions, gradient: 'from-emerald-500 to-emerald-600' },
      { name: 'Rejected Submissions', color: '#ef4444', value: dashboardData.rejectedSubmissions, gradient: 'from-red-500 to-red-600' },
      { name: 'Orders in QA', color: '#f59e0b', value: dashboardData.ordersInQA, gradient: 'from-amber-500 to-amber-600' },
      { name: 'Orders in Work', color: '#3b82f6', value: dashboardData.ordersInWork, gradient: 'from-blue-500 to-blue-600' },
    ];

    // Use actual dashboard values directly - no dummy data
    const maxValue = Math.max(...categories.map(cat => cat.value), 1);
    const roundedMax = Math.max(maxValue * 1.2, 10); // Add 20% padding and minimum of 10
    const yAxisSteps = 5;
    const stepValue = roundedMax / yAxisSteps;

    if (categories.every(cat => cat.value === 0)) {
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
          <div className="w-12 flex flex-col justify-between text-xs text-gray-600 pr-2">
            {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
              <div key={i} className="text-right">
                {Math.round(stepValue * (yAxisSteps - i))}
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

            {/* Real Data Bars Container */}
            <div className="absolute inset-0 flex items-end justify-center gap-8 px-8">
              {categories.map((category, index) => {
                const value = category.value;
                const height = roundedMax > 0 ? (value / roundedMax) * 100 : 0;
                const minHeight = value > 0 ? Math.max(5, height) : 0;
                const finalHeight = Math.max(minHeight, height);

                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    {/* Value label above bar */}
                    <div className="text-sm font-bold text-gray-800 mb-2 min-h-[20px] flex items-end">
                      {value > 0 && (
                        <span className="bg-white px-2 py-1 rounded shadow-sm border">
                          {value.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Enhanced Bar with gradient and shadow */}
                    <div
                      className={`w-16 rounded-lg transition-all duration-1000 ease-out shadow-lg hover:shadow-xl hover:scale-105 bg-gradient-to-t ${category.gradient} border border-white/20`}
                      style={{
                        height: `${finalHeight}%`,
                        minHeight: value > 0 ? '12px' : '0px',
                        animationDelay: `${index * 0.2}s`,
                        backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)`,
                        backgroundSize: '8px 8px'
                      }}
                    >
                      {/* Inner glow effect */}
                      <div className="w-full h-full rounded-lg bg-gradient-to-t from-transparent to-white/10"></div>
                    </div>

                    {/* Category label below bar */}
                    <div className="text-xs font-medium text-gray-700 text-center w-16 leading-tight mt-3">
                      {category.name.replace(' Submissions', '').replace(' Orders', '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
              <div
                className={`w-5 h-5 rounded-md shadow-sm bg-gradient-to-br ${category.gradient} border border-white/20`}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{category.name}</span>
                <span className="text-xs text-gray-600">{category.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
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
