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
    bgColor,
    index = 0
  }: {
    icon: any,
    title: string,
    value: number,
    bgColor: string,
    index?: number
  }) => (
    <div
      className={`${bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl relative overflow-hidden group animate-in slide-in-from-bottom`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating orbs - responsive sizes */}
      <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 bg-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
      <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-8 sm:w-12 md:w-14 lg:w-16 h-8 sm:h-12 md:h-14 lg:h-16 bg-white/10 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1 mr-2 sm:mr-3">
          <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wide truncate">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tabular-nums animate-in zoom-in duration-700 leading-none" style={{ animationDelay: `${index * 200 + 300}ms` }}>
            {value.toLocaleString()}
          </p>
          <div className="w-8 sm:w-10 md:w-12 h-0.5 sm:h-1 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300"></div>
        </div>
        <div className="relative flex-shrink-0">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white/90 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 lg:gap-6 animate-in slide-in-from-top duration-500">
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg lg:text-xl animate-in slide-in-from-left duration-700" style={{ animationDelay: '200ms' }}>
            Overview of submissions and performance
          </p>
          <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-12 sm:w-16 md:w-20 lg:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-in slide-in-from-left duration-1000" style={{ animationDelay: '500ms' }}></div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 5xl:grid-cols-8 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10">
        <MetricCard
          icon={FileText}
          title="Total Submissions"
          value={dashboardData.totalSubmissions}
          bgColor="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
          index={0}
        />
        <MetricCard
          icon={CheckCircle}
          title="Approved Submissions"
          value={dashboardData.approvedSubmissions}
          bgColor="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600"
          index={1}
        />
        <MetricCard
          icon={Clock}
          title="Orders in QA"
          value={dashboardData.ordersInQA}
          bgColor="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600"
          index={2}
        />
        <MetricCard
          icon={XCircle}
          title="Rejected Submissions"
          value={dashboardData.rejectedSubmissions}
          bgColor="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600"
          index={3}
        />
        <MetricCard
          icon={Clock}
          title={user?.role === 'Admin' ? "Orders in Work" : "Orders in Work"}
          value={dashboardData.ordersInWork}
          bgColor="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600"
          index={4}
        />
      </div>

      {/* Analytics Section */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-1000" style={{ animationDelay: '800ms' }}>
        <div className="text-center space-y-2 sm:space-y-3">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
            Performance Analytics
          </h3>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4">
            Real-time visualization of your submissions and performance metrics
          </p>
          <div className="w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>

        {/* Chart Section */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 mx-auto max-w-full">
          <CardHeader className="pb-4 sm:pb-6 px-3 sm:px-4 md:px-6 lg:px-8 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                <span className="hidden sm:inline">Work categories / submissions by time</span>
                <span className="sm:hidden">Work Categories</span>
              </CardTitle>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-32 md:w-36 lg:w-40 bg-white/90 backdrop-blur-sm border-slate-300 focus:border-blue-500 hover:border-purple-400 transition-all duration-300 rounded-lg sm:rounded-xl shadow-lg text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl rounded-lg sm:rounded-xl">
                  <SelectItem value="Last Day" className="hover:bg-blue-50 rounded-lg transition-colors duration-200 text-xs sm:text-sm">Last Day</SelectItem>
                  <SelectItem value="Last Week" className="hover:bg-blue-50 rounded-lg transition-colors duration-200 text-xs sm:text-sm">Last Week</SelectItem>
                  <SelectItem value="Last Month" className="hover:bg-blue-50 rounded-lg transition-colors duration-200 text-xs sm:text-sm">Last Month</SelectItem>
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
