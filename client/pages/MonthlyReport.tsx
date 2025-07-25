import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Users,
  Bot,
  Sparkles,
  DollarSign,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';
import AIInvoiceGenerator from '@/components/AIInvoiceGenerator';

interface WorkerReport {
  worker: UserType;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  deletedSubmissions: number;
  pendingSubmissions: number;
  approvalRate: number;
  categories: {
    [category: string]: {
      total: number;
      approved: number;
      rejected: number;
      deleted: number;
      pending: number;
    };
  };
}

export default function MonthlyReport() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [expandedWorkers, setExpandedWorkers] = useState<Set<string>>(new Set());
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<UserType | null>(null);

  function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchWorkOrders();
    fetchUsers();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/work-orders');
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleWorkerExpansion = (workerId: string) => {
    const newExpanded = new Set(expandedWorkers);
    if (newExpanded.has(workerId)) {
      newExpanded.delete(workerId);
    } else {
      newExpanded.add(workerId);
    }
    setExpandedWorkers(newExpanded);
  };

  const openAIGenerator = (worker: UserType) => {
    setSelectedWorker(worker);
    setAiGeneratorOpen(true);
  };

  const getWorkerReports = (): WorkerReport[] => {
    const [year, month] = selectedMonth.split('-');
    
    // Filter orders for selected month
    const monthlyOrders = workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === parseInt(year) &&
             (orderDate.getMonth() + 1) === parseInt(month);
    });

    // Get workers who have submissions
    const workersWithSubmissions = users.filter(user => 
      user.role === 'Worker' && 
      monthlyOrders.some(order => order.createdBy === user.id || order.assignedTo === user.id)
    );

    return workersWithSubmissions.map(worker => {
      // Get all orders for this worker (both created by them and assigned to them)
      const workerOrders = monthlyOrders.filter(order => 
        order.createdBy === worker.id || order.assignedTo === worker.id
      );

      // Calculate totals
      const totalSubmissions = workerOrders.length;
      const approvedSubmissions = workerOrders.filter(order => order.status === 'Approved').length;
      const rejectedSubmissions = workerOrders.filter(order => order.status === 'Rejected').length;
      const deletedSubmissions = workerOrders.filter(order => order.status === 'Deleted').length;
      const pendingSubmissions = workerOrders.filter(order => order.status === 'Under QA' || order.status === 'In Progress').length;
      const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

      // Group by categories
      const categories: WorkerReport['categories'] = {};
      workerOrders.forEach(order => {
        const category = order.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = { total: 0, approved: 0, rejected: 0, deleted: 0, pending: 0 };
        }
        categories[category].total++;
        if (order.status === 'Approved') categories[category].approved++;
        if (order.status === 'Rejected') categories[category].rejected++;
        if (order.status === 'Deleted') categories[category].deleted++;
        if (order.status === 'Under QA' || order.status === 'In Progress') categories[category].pending++;
      });

      return {
        worker,
        totalSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        deletedSubmissions,
        pendingSubmissions,
        approvalRate,
        categories
      };
    }).sort((a, b) => b.totalSubmissions - a.totalSubmissions); // Sort by total submissions descending
  };

  const workerReports = getWorkerReports();

  // Calculate overall monthly statistics
  const monthlyStats = {
    totalWorkers: workerReports.length,
    totalSubmissions: workerReports.reduce((sum, report) => sum + report.totalSubmissions, 0),
    totalApproved: workerReports.reduce((sum, report) => sum + report.approvedSubmissions, 0),
    totalRejected: workerReports.reduce((sum, report) => sum + report.rejectedSubmissions, 0),
    totalPending: workerReports.reduce((sum, report) => sum + report.pendingSubmissions, 0),
    averageApprovalRate: workerReports.length > 0 ? workerReports.reduce((sum, report) => sum + report.approvalRate, 0) / workerReports.length : 0
  };

  const getApprovalRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getApprovalRateIcon = (rate: number) => {
    if (rate >= 80) return <Award className="h-4 w-4" />;
    if (rate >= 60) return <Target className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [year, month] = selectedMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Monthly Worker Report</h2>
          <p className="text-gray-600 mt-1">Comprehensive worker performance analytics and AI-powered invoice generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

      {/* Enhanced Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-600 font-medium text-sm">Active Workers</p>
                <p className="text-2xl font-bold text-blue-800">{monthlyStats.totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-600 font-medium text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-purple-800">{monthlyStats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-800">{monthlyStats.totalApproved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-orange-600 font-medium text-sm">Pending</p>
                <p className="text-2xl font-bold text-orange-800">{monthlyStats.totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-cyan-600 font-medium text-sm">Avg. Approval</p>
                <p className="text-2xl font-bold text-cyan-800">{monthlyStats.averageApprovalRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Worker Reports */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            Worker Performance Dashboard - {monthName}
          </CardTitle>
          <CardDescription>
            Individual worker analytics with AI-powered invoice generation capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {workerReports.length > 0 ? (
            <div className="space-y-0">
              {workerReports.map((report, index) => (
                <div key={report.worker.id} className={`${index !== workerReports.length - 1 ? 'border-b' : ''}`}>
                  <div 
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleWorkerExpansion(report.worker.id)}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Worker Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-gray-200">
                          <AvatarImage src={report.worker.profilePhoto} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getUserInitials(report.worker.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{report.worker.name}</h3>
                          <p className="text-sm text-gray-500">{report.worker.email}</p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="flex items-center gap-8 flex-1">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{report.totalSubmissions}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{report.approvedSubmissions}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Approved</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{report.pendingSubmissions}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{report.rejectedSubmissions}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Rejected</p>
                        </div>
                      </div>

                      {/* Approval Rate */}
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${getApprovalRateColor(report.approvalRate)}`}>
                          {getApprovalRateIcon(report.approvalRate)}
                          <span className="font-semibold text-sm">{report.approvalRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* AI Invoice Generator Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAIGenerator(report.worker);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        size="sm"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate Invoice with AI
                      </Button>
                      
                      <ChevronRight 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedWorkers.has(report.worker.id) ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Expanded Category Details */}
                  {expandedWorkers.has(report.worker.id) && (
                    <div className="px-6 pb-6 bg-gray-50">
                      <Separator className="mb-6" />
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="h-4 w-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">Category Breakdown</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Object.entries(report.categories).map(([category, stats]) => (
                            <Card key={category} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-800 truncate">{category}</CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <Badge variant="outline" className="text-xs">{stats.total}</Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-green-600">Approved</span>
                                      <span className="font-medium text-green-600">{stats.approved}</span>
                                    </div>
                                    <Progress 
                                      value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} 
                                      className="h-1"
                                    />
                                  </div>
                                  
                                  {stats.pending > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-orange-600">Pending</span>
                                      <span className="font-medium text-orange-600">{stats.pending}</span>
                                    </div>
                                  )}
                                  
                                  {stats.rejected > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-red-600">Rejected</span>
                                      <span className="font-medium text-red-600">{stats.rejected}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {Object.keys(report.categories).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No categories found for this worker</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No submissions for {monthName}</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Worker submissions and analytics will appear here when data becomes available for the selected month.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Invoice Generator Modal */}
      {selectedWorker && (
        <AIInvoiceGenerator
          isOpen={aiGeneratorOpen}
          onClose={() => {
            setAiGeneratorOpen(false);
            setSelectedWorker(null);
          }}
          worker={selectedWorker}
          workOrders={workOrders}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
}
