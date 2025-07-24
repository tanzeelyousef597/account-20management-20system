import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

const chartData = [
  { category: 'Napoleon Link Building', submissions: 0 },
  { category: 'AI Content Writing', submissions: 0 },
  { category: 'Blog Writing', submissions: 0 },
  { category: 'SEO Optimization', submissions: 0 },
  { category: 'Social Media', submissions: 0 },
];

// Simple custom chart component to replace recharts and fix warnings
const SimpleBarChart = ({ data }: { data: typeof chartData }) => {
  const maxValue = Math.max(...data.map(d => d.submissions), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 truncate">{item.category}</span>
              <span className="text-blue-600 font-bold">{item.submissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: maxValue > 0 ? `${(item.submissions / maxValue) * 100}%` : '0%',
                  minWidth: item.submissions > 0 ? '8px' : '0px'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600 text-lg">
          {user?.role === 'Admin'
            ? 'Manage your team and oversee all operations from here'
            : 'Track your submissions and monitor your progress'
          }
        </p>
      </div>

      {/* Submission Trends Chart - Full Width */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Submission Trends by Category</CardTitle>
              <CardDescription className="text-base">
                Real-time breakdown of submissions across work categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar
                dataKey="submissions"
                fill="url(#gradient)"
                radius={[6, 6, 0, 0]}
                stroke="#2563eb"
                strokeWidth={1}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          {chartData.every(item => item.submissions === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-500 font-medium">No submissions yet</p>
                <p className="text-sm text-gray-400">
                  {user?.role === 'Admin'
                    ? 'Data will appear when workers submit their orders'
                    : 'Start submitting work orders to see your progress here'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                {user?.role === 'Admin' ? 'System Overview' : 'Your Workspace'}
              </h3>
              <p className="text-blue-100 text-lg">
                {user?.role === 'Admin'
                  ? 'All metrics will populate dynamically as your team submits work orders and completes tasks.'
                  : 'Your dashboard will show real-time updates as you submit orders and track your progress.'
                }
              </p>
            </div>
            <div className="hidden md:block">
              <div className="p-4 bg-white/10 rounded-full">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
