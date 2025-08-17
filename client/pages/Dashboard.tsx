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
import { containerResponsive, gridResponsive, textResponsive, cardResponsive, spaceResponsive } from '@/utils/responsive';

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
      className={`${bgColor} rounded-xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group transform hover:scale-105 animate-scale-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Enhanced background animations */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full -translate-y-6 translate-x-6"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-2 flex-1 mr-3">
          <p className="text-white/95 text-sm md:text-base font-semibold leading-relaxed">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold tabular-nums leading-tight">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="flex-shrink-0 p-2 bg-white/15 rounded-lg backdrop-blur-sm">
          <Icon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  );

  const ModernBarChart = ({ data }: { data: { category: string; submissions: number }[] }) => {
    // Categories with real dashboard data and soft colors
    const categories = [
      { name: 'Total Submissions', color: '#3b82f6', value: dashboardData.totalSubmissions },
      { name: 'Approved', color: '#10b981', value: dashboardData.approvedSubmissions },
      { name: 'In QA', color: '#f59e0b', value: dashboardData.ordersInQA },
      { name: 'Rejected', color: '#ef4444', value: dashboardData.rejectedSubmissions },
      { name: 'In Work', color: '#8b5cf6', value: dashboardData.ordersInWork },
    ];

    // Calculate max value for scaling
    const maxValue = Math.max(...categories.map(cat => cat.value), 1);
    const roundedMax = Math.ceil(maxValue * 1.1 / 10) * 10; // Round up to nearest 10
    const yAxisSteps = 5;
    const stepValue = roundedMax / yAxisSteps;

    if (categories.every(cat => cat.value === 0)) {
      return (
        <div className="h-80 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-center space-y-3">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto" />
            <p className="text-slate-600 font-medium">No data available</p>
            <p className="text-sm text-slate-400">
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
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-xl border border-slate-200/60 p-6 shadow-lg backdrop-blur-sm animate-fade-in">
        {/* Chart Container */}
        <div className="relative h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 rounded-lg opacity-50"></div>
          {/* Y-Axis */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-slate-500 pr-2">
            {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
              <div key={i} className="text-right leading-none">
                {Math.round(stepValue * (yAxisSteps - i))}
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="ml-12 h-full relative">
            {/* Horizontal Grid Lines */}
            {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-slate-100"
                style={{ top: `${(i / yAxisSteps) * 100}%` }}
              />
            ))}

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-center gap-4 px-4">
              {categories.map((category, index) => {
                const value = category.value;
                const heightPercentage = roundedMax > 0 ? (value / roundedMax) * 100 : 0;
                const minHeight = value > 0 ? Math.max(heightPercentage, 3) : 0;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 max-w-24 sm:max-w-28 md:max-w-32 lg:max-w-36">
                    {/* Value label above bar */}
                    {value > 0 && (
                      <div className="text-sm sm:text-base font-bold text-slate-700 mb-3 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-200/80 backdrop-blur-sm">
                        {value}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className="w-20 sm:w-24 md:w-28 lg:w-32 rounded-t-xl transition-all duration-500 hover:opacity-90 relative group transform hover:scale-105 animate-slide-up shadow-xl border-2 border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}, ${category.color}cc, ${category.color}dd)`,
                        height: `${minHeight}%`,
                        minHeight: value > 0 ? '16px' : '0px',
                        animationDelay: `${index * 100}ms`,
                        boxShadow: `0 6px 25px ${category.color}50, 0 12px 50px ${category.color}30`
                      }}
                    >
                      {/* Enhanced hover effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/15 to-white/35 opacity-0 group-hover:opacity-100 rounded-t-xl transition-all duration-300"></div>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 rounded-t-xl transition-opacity duration-200"></div>
                      <div className="absolute -top-px left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>

                      {/* Subtle inner glow */}
                      <div className="absolute inset-3 rounded-t-lg bg-gradient-to-t from-transparent to-white/15 opacity-70"></div>

                      {/* Top highlight - enhanced */}
                      <div className="absolute top-0 left-3 right-3 h-4 bg-white/25 rounded-t-lg"></div>

                      {/* Side highlights for 3D effect */}
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-white/30 to-transparent rounded-tl-xl"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-white/30 to-transparent rounded-tr-xl"></div>
                    </div>

                    {/* Category label */}
                    <div className="text-sm sm:text-base font-semibold text-slate-700 text-center mt-4 leading-tight px-2">
                      {category.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-slate-100">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-md shadow-sm"
                style={{
                  backgroundColor: category.color,
                  boxShadow: `0 2px 8px ${category.color}40`
                }}
              />
              <span className="text-sm font-medium text-slate-600">{category.name}</span>
              <span className="text-sm text-slate-500 font-semibold">({category.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${containerResponsive} ${spaceResponsive}`}>
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 xs:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className={`${textResponsive.xl} font-semibold text-slate-700 truncate`}>
            Dashboard
          </h2>
          <p className={`text-slate-500 mt-1 ${textResponsive.base}`}>
            Overview of submissions and performance
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard
          icon={FileText}
          title="Total Submissions"
          value={dashboardData.totalSubmissions}
          bgColor="bg-gradient-to-br from-blue-400 to-blue-500"
          index={0}
        />
        <MetricCard
          icon={CheckCircle}
          title="Approved Submissions"
          value={dashboardData.approvedSubmissions}
          bgColor="bg-gradient-to-br from-emerald-400 to-emerald-500"
          index={1}
        />
        <MetricCard
          icon={Clock}
          title="Orders in QA"
          value={dashboardData.ordersInQA}
          bgColor="bg-gradient-to-br from-amber-400 to-amber-500"
          index={2}
        />
        <MetricCard
          icon={XCircle}
          title="Rejected Submissions"
          value={dashboardData.rejectedSubmissions}
          bgColor="bg-gradient-to-br from-rose-400 to-rose-500"
          index={3}
        />
        <MetricCard
          icon={Clock}
          title={user?.role === 'Admin' ? "Orders in Work" : "Orders in Work"}
          value={dashboardData.ordersInWork}
          bgColor="bg-gradient-to-br from-violet-400 to-violet-500"
          index={4}
        />
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-700">
            Work Categories / Submissions by Time
          </h3>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            Performance overview across different work categories
          </p>
        </div>

        {/* Chart Section */}
        <Card className="shadow-lg border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 backdrop-blur-sm animate-scale-in">
          <CardHeader className={`${cardResponsive} pb-4 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/30 to-blue-50/30`}>
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
              <CardTitle className={`${textResponsive.lg} font-semibold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent truncate`}>
                <span className="hidden sm:inline">Work Categories / Submissions by Time</span>
                <span className="sm:hidden">Work Categories</span>
              </CardTitle>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full xs:w-auto xs:min-w-32 sm:w-40 bg-white border-slate-300 focus:border-blue-400 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="Last Day">Last Day</SelectItem>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Last Year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className={cardResponsive}>
            <ModernBarChart data={dashboardData.categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
