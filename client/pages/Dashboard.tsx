import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Users,
  AlertCircle
} from 'lucide-react';
import { DashboardStats } from '@shared/types';

const chartData = [
  { category: 'Napoleon Link Building', submissions: 45 },
  { category: 'AI Content Writing', submissions: 32 },
  { category: 'Blog Writing', submissions: 28 },
  { category: 'SEO Optimization', submissions: 19 },
  { category: 'Social Media', submissions: 15 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    ordersInQA: 0,
    totalOrders: 0,
    thisMonthSubmissions: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const adminCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ClipboardList,
      description: 'All work orders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Orders in QA',
      value: stats.ordersInQA,
      icon: Clock,
      description: 'Pending review',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: CheckCircle,
      description: 'All submissions',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: FileText,
      description: 'To be generated',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const workerCards = [
    {
      title: 'My Submissions',
      value: stats.totalSubmissions,
      icon: ClipboardList,
      description: 'Total submitted',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Approved',
      value: stats.approvedSubmissions,
      icon: CheckCircle,
      description: 'Successfully approved',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Month',
      value: stats.thisMonthSubmissions,
      icon: TrendingUp,
      description: 'Current month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'In Review',
      value: stats.ordersInQA,
      icon: Clock,
      description: 'Under review',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const cards = user?.role === 'Admin' ? adminCards : workerCards;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your account management system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends by Category</CardTitle>
            <CardDescription>Monthly submission breakdown by work category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="submissions" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order #1234 approved</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New work order created</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-full">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice generated</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-50 rounded-full">
                  <Users className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user added</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'Admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <ClipboardList className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium">Create Work Order</h3>
                <p className="text-sm text-gray-500">Add a new work assignment</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium">Add User</h3>
                <p className="text-sm text-gray-500">Create new user account</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium">Generate Invoice</h3>
                <p className="text-sm text-gray-500">Create manual invoice</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
