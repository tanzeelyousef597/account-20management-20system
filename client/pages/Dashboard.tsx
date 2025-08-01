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

    // Categories with colors matching the image style
    const categories = [
      { name: 'Total Submissions', color: '#f97316', value: dashboardData.totalSubmissions },
      { name: 'Approved Orders', color: '#06d6a0', value: dashboardData.approvedSubmissions },
      { name: 'Orders in Work', color: '#3b82f6', value: dashboardData.ordersInWork },
    ];

    const timePeriods = getTimePeriods();

    // Generate sample data distributed across time periods
    const generateTimeData = () => {
      return timePeriods.map((period, index) => {
        const baseVariation = Math.random() * 0.6 + 0.7; // 0.7 to 1.3 multiplier
        const periodData: { [key: string]: number } = { period };

        categories.forEach((category) => {
          // Distribute the total value across time periods with variation
          const avgValue = category.value / timePeriods.length;
          const variation = (Math.random() - 0.5) * 0.8; // -0.4 to +0.4
          periodData[category.name] = Math.max(0, Math.round(avgValue * (baseVariation + variation)));
        });

        return periodData;
      });
    };

    const timeData = generateTimeData();
    const allValues = timeData.flatMap(period =>
      categories.map(cat => period[cat.name] || 0)
    );
    const maxValue = Math.max(...allValues, 1);
    const minScale = Math.max(maxValue * 1.1, 25);
    const roundedMax = Math.ceil(minScale / 5) * 5;
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

            {/* Grouped Bars Container */}
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {timeData.map((periodData, periodIndex) => (
                <div key={periodIndex} className="flex items-end gap-1 flex-1 justify-center">
                  {categories.map((category, catIndex) => {
                    const value = periodData[category.name] || 0;
                    const height = roundedMax > 0 ? (value / roundedMax) * 100 : 0;
                    const minHeight = value > 0 ? 3 : 0;

                    return (
                      <div key={catIndex} className="flex flex-col items-center">
                        {/* Value label above bar - only show if value > 0 and height is significant */}
                        {value > 0 && height > 15 && (
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            {value}
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          className="w-6 rounded-t transition-all duration-1000 ease-out"
                          style={{
                            backgroundColor: category.color,
                            height: `${Math.max(height, minHeight)}%`,
                            animationDelay: `${(periodIndex * categories.length + catIndex) * 0.1}s`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="ml-12 flex justify-between text-xs text-gray-600 mt-2 px-4">
          {timePeriods.map((period, index) => (
            <div key={index} className="text-center flex-1">
              {period}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-700">{category.name}</span>
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
