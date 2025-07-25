import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Users
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

interface WorkerReport {
  worker: UserType;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  deletedSubmissions: number;
  categories: {
    [category: string]: {
      total: number;
      approved: number;
      rejected: number;
      deleted: number;
    };
  };
}

export default function MonthlyReport() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [expandedWorkers, setExpandedWorkers] = useState<Set<string>>(new Set());

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
      const deletedSubmissions = 0; // In current system, deleted orders are removed from the array

      // Group by categories
      const categories: WorkerReport['categories'] = {};
      workerOrders.forEach(order => {
        const category = order.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = { total: 0, approved: 0, rejected: 0, deleted: 0 };
        }
        categories[category].total++;
        if (order.status === 'Approved') categories[category].approved++;
        if (order.status === 'Rejected') categories[category].rejected++;
      });

      return {
        worker,
        totalSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        deletedSubmissions,
        categories
      };
    });
  };

  const workerReports = getWorkerReports();

  // Calculate overall monthly statistics
  const monthlyStats = {
    totalWorkers: workerReports.length,
    totalSubmissions: workerReports.reduce((sum, report) => sum + report.totalSubmissions, 0),
    totalApproved: workerReports.reduce((sum, report) => sum + report.approvedSubmissions, 0),
    totalRejected: workerReports.reduce((sum, report) => sum + report.rejectedSubmissions, 0),
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Under QA': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Monthly Worker Submission Report</h2>
          <p className="text-gray-600 mt-1">Track worker submissions and progress by month</p>
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

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-600 font-medium">Active Workers</p>
                <p className="text-2xl font-bold text-blue-800">{monthlyStats.totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-600 font-medium">Total Submissions</p>
                <p className="text-2xl font-bold text-purple-800">{monthlyStats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-800">{monthlyStats.totalApproved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{monthlyStats.totalRejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Reports */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Worker Submission Breakdown
          </CardTitle>
          <CardDescription>
            Monthly submission details organized by worker and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workerReports.length > 0 ? (
            <div className="space-y-4">
              {workerReports.map((report) => (
                <div key={report.worker.id} className="border rounded-lg p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleWorkerExpansion(report.worker.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-lg">{report.worker.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>{report.totalSubmissions} Total</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{report.approvedSubmissions} Approved</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{report.rejectedSubmissions} Rejected</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedWorkers.has(report.worker.id) ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>

                  {expandedWorkers.has(report.worker.id) && (
                    <div className="mt-4 pl-6">
                      <h4 className="font-medium text-gray-900 mb-3">Categories Breakdown:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(report.categories).map(([category, stats]) => (
                          <div key={category} className="bg-gray-50 rounded p-3">
                            <h5 className="font-medium text-gray-800 mb-2">{category}</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Total:</span>
                                <span className="font-medium">{stats.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Approved:</span>
                                <span className="font-medium text-green-600">{stats.approved}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-600">Rejected:</span>
                                <span className="font-medium text-red-600">{stats.rejected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-yellow-600">Pending:</span>
                                <span className="font-medium text-yellow-600">
                                  {stats.total - stats.approved - stats.rejected}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions this month</h3>
              <p className="text-gray-500">Worker submissions will appear here when available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
