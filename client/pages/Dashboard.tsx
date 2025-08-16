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
      className={`${bgColor} rounded-xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group transform hover:scale-105 animate-scale-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Enhanced background animations */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-2 min-w-0 flex-1 mr-3">
          <p className="text-white/90 text-sm font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl font-semibold tabular-nums leading-tight">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 md:h-7 md:w-7 text-white/80" />
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
                  <div key={index} className="flex flex-col items-center flex-1 max-w-16">
                    {/* Value label above bar */}
                    {value > 0 && (
                      <div className="text-xs font-semibold text-slate-700 mb-1 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                        {value}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className="w-16 sm:w-18 md:w-20 rounded-t-xl transition-all duration-500 hover:opacity-90 relative group transform hover:scale-105 animate-slide-up shadow-xl border-2 border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}, ${category.color}cc, ${category.color}dd)`,
                        height: `${minHeight}%`,
                        minHeight: value > 0 ? '12px' : '0px',
                        animationDelay: `${index * 100}ms`,
                        boxShadow: `0 4px 20px ${category.color}40, 0 8px 40px ${category.color}20`
                      }}
                    >
                      {/* Enhanced hover effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/15 to-white/35 opacity-0 group-hover:opacity-100 rounded-t-xl transition-all duration-300"></div>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 rounded-t-xl transition-opacity duration-200"></div>
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>

                      {/* Subtle inner glow */}
                      <div className="absolute inset-2 rounded-t-lg bg-gradient-to-t from-transparent to-white/10 opacity-60"></div>

                      {/* Top highlight */}
                      <div className="absolute top-0 left-2 right-2 h-3 bg-white/20 rounded-t-lg"></div>
                    </div>

                    {/* Category label */}
                    <div className="text-xs font-medium text-slate-600 text-center mt-2 leading-tight">
                      {category.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-slate-600">{category.name}</span>
              <span className="text-xs text-slate-400">({category.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container-responsive space-responsive">
      {/* Header */}
      <div className="flex-responsive-between gap-responsive">
        <div className="min-w-0 flex-1">
          <h2 className="text-responsive-xl font-semibold text-slate-700 truncate">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1 text-responsive">
            Overview of submissions and performance
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 5xl:grid-cols-8 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10">
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
          <CardHeader className="pb-4 px-6 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/30 to-blue-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                Work Categories / Submissions by Time
              </CardTitle>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white border-slate-300 focus:border-blue-400 transition-colors duration-200">
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
          <CardContent className="p-6">
            <ModernBarChart data={dashboardData.categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
