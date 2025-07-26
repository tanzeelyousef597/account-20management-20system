import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Download, 
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  Calculator,
  Bot,
  Sparkles,
  Zap
} from 'lucide-react';
import { Invoice, User as UserType, WorkOrder } from '@shared/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import AIInvoiceGenerator from '@/components/AIInvoiceGenerator';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<UserType | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [userStats, setUserStats] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    fines: 0,
    bonuses: 0,
  });
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    fixedPay: '',
    workPay: '',
    fine: '',
    bonus: '',
    finalAmount: '',
  });

  const { formatAmount } = useCurrency();

  function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
  }, [selectedUserId, formData.month]);

  useEffect(() => {
    // Calculate final amount when other fields change
    const fixedPay = parseFloat(formData.fixedPay) || 0;
    const workPay = parseFloat(formData.workPay) || 0;
    const fine = parseFloat(formData.fine) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    
    const finalAmount = fixedPay + workPay + bonus - fine;
    setFormData(prev => ({
      ...prev,
      finalAmount: finalAmount.toFixed(2)
    }));
  }, [formData.fixedPay, formData.workPay, formData.fine, formData.bonus]);

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices from:', window.location.origin + '/api/invoices');
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/invoices`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      console.error('Current window location:', window.location.href);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', window.location.origin + '/api/users');
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/users`);
      console.log('Users response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Current window location:', window.location.href);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      console.log('Fetching work orders from:', window.location.origin + '/api/work-orders');
      const response = await fetch('/api/work-orders');
      console.log('Work orders response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      } else {
        console.error('Failed to fetch work orders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
      console.error('Current window location:', window.location.href);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const [year, month] = formData.month.split('-');
      
      // Get work orders for this user in the selected month
      const userWorkOrders = workOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return (order.createdBy === userId || order.assignedTo === userId) &&
               orderDate.getFullYear() === parseInt(year) &&
               (orderDate.getMonth() + 1) === parseInt(month);
      });

      const totalSubmissions = userWorkOrders.reduce((sum, order) => sum + (order.payRate || 0), 0);
      const approvedSubmissions = userWorkOrders
        .filter(order => order.status === 'Approved')
        .reduce((sum, order) => sum + (order.payRate || 0), 0);

      // Fetch fines and bonuses for this user and month
      const [finesResponse, bonusesResponse] = await Promise.all([
        fetch(`/api/fines?userId=${userId}&month=${formData.month}`),
        fetch(`/api/bonuses?userId=${userId}&month=${formData.month}`)
      ]);

      let fines = 0;
      let bonuses = 0;

      if (finesResponse.ok) {
        const finesData = await finesResponse.json();
        fines = finesData.reduce((sum: number, fine: any) => sum + (fine.amount || 0), 0);
      }

      if (bonusesResponse.ok) {
        const bonusesData = await bonusesResponse.json();
        bonuses = bonusesData.reduce((sum: number, bonus: any) => sum + (bonus.amount || 0), 0);
      }

      setUserStats({
        totalSubmissions,
        approvedSubmissions,
        fines,
        bonuses
      });

      // Auto-populate form with calculated work pay
      setFormData(prev => ({
        ...prev,
        workPay: approvedSubmissions.toString(),
        fine: fines.toString(),
        bonus: bonuses.toString()
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      alert('Please select a worker');
      return;
    }

    const selectedUser = users.find(user => user.id === selectedUserId);
    if (!selectedUser) {
      alert('Selected user not found');
      return;
    }

    try {
      const invoiceData = {
        workerId: selectedUserId,
        workerName: selectedUser.name,
        month: formData.month,
        year: parseInt(formData.month.split('-')[0]),
        submissionCount: userStats.totalSubmissions,
        fixedPay: parseFloat(formData.fixedPay) || 0,
        workPay: parseFloat(formData.workPay) || 0,
        fine: parseFloat(formData.fine) || 0,
        bonus: parseFloat(formData.bonus) || 0,
        totalAmount: parseFloat(formData.finalAmount) || 0,
        isManual: true,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        fetchInvoices();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        const error = await response.text();
        alert(`Failed to create invoice: ${error}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  const openAIGenerator = (user: UserType) => {
    setSelectedWorker(user);
    setIsAIGeneratorOpen(true);
  };

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      fixedPay: '',
      workPay: '',
      fine: '',
      bonus: '',
      finalAmount: '',
    });
    setSelectedUserId('');
    setUserStats({
      totalSubmissions: 0,
      approvedSubmissions: 0,
      fines: 0,
      bonuses: 0,
    });
  };

  const getStatusBadge = (isManual: boolean) => {
    return (
      <Badge className={isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
        {isManual ? 'Manual' : 'AI Generated'}
      </Badge>
    );
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Create a simple invoice text
    const invoiceText = `
MT Web Experts - Invoice

Worker: ${invoice.workerName}
Period: ${new Date(invoice.year, parseInt(invoice.month) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
Generated: ${new Date(invoice.generatedAt).toLocaleDateString()}

Submissions: ${invoice.submissionCount}
Fixed Pay: ${formatAmount(invoice.fixedPay)}
Work Pay: ${formatAmount(invoice.workPay)}
Bonus: ${formatAmount(invoice.bonus)}
Fine: ${formatAmount(invoice.fine)}
----------------------------
Total Amount: ${formatAmount(invoice.totalAmount)}

Type: ${invoice.isManual ? 'Manual' : 'AI Generated'}
    `;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.workerName}-${invoice.month}-${invoice.year}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">Manage worker invoices with AI-powered generation</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Manual Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Manual Invoice</DialogTitle>
                <DialogDescription>Generate an invoice with custom values</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="worker">Select Worker</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => user.role === 'Worker').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {selectedUserId && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Worker Statistics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Total Submissions:</span>
                          <span className="font-semibold ml-2">{userStats.totalSubmissions}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Approved Submissions:</span>
                          <span className="font-semibold ml-2">{userStats.approvedSubmissions}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Total Fines:</span>
                          <span className="font-semibold ml-2">{formatAmount(userStats.fines)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Total Bonuses:</span>
                          <span className="font-semibold ml-2">{formatAmount(userStats.bonuses)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixedPay">Fixed Pay</Label>
                    <Input
                      id="fixedPay"
                      type="number"
                      step="0.01"
                      value={formData.fixedPay}
                      onChange={(e) => setFormData({...formData, fixedPay: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workPay">Work Pay</Label>
                    <Input
                      id="workPay"
                      type="number"
                      step="0.01"
                      value={formData.workPay}
                      onChange={(e) => setFormData({...formData, workPay: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fine">Fine</Label>
                    <Input
                      id="fine"
                      type="number"
                      step="0.01"
                      value={formData.fine}
                      onChange={(e) => setFormData({...formData, fine: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input
                      id="bonus"
                      type="number"
                      step="0.01"
                      value={formData.bonus}
                      onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="finalAmount">Final Amount</Label>
                  <Input
                    id="finalAmount"
                    type="number"
                    step="0.01"
                    value={formData.finalAmount}
                    readOnly
                    className="bg-gray-50 font-semibold text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Calculated: Fixed Pay + Work Pay + Bonus - Fine
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Calculator className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setIsAIGeneratorOpen(true)}
          >
            <Bot className="h-4 w-4 mr-2" />
            <Sparkles className="h-3 w-3 mr-1" />
            AI Invoice Generator
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-600 font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-800">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatAmount(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-600 font-medium">AI Generated</p>
                <p className="text-2xl font-bold text-purple-800">
                  {invoices.filter(inv => !inv.isManual).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-orange-600 font-medium">This Month</p>
                <p className="text-2xl font-bold text-orange-800">
                  {invoices.filter(inv => {
                    const invMonth = `${inv.year}-${String(parseInt(inv.month)).padStart(2, '0')}`;
                    return invMonth === getCurrentMonth();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Invoices
          </CardTitle>
          <CardDescription>
            Manage and track worker invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Work Pay</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{invoice.workerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(invoice.year, parseInt(invoice.month) - 1).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.submissionCount}</TableCell>
                      <TableCell>{formatAmount(invoice.workPay)}</TableCell>
                      <TableCell className="text-green-600">{formatAmount(invoice.bonus)}</TableCell>
                      <TableCell className="text-red-600">{formatAmount(invoice.fine)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg">{formatAmount(invoice.totalAmount)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.isManual)}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Invoice
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAIGeneratorOpen(true)}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Generator
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Invoice Generator Modal */}
      <Dialog open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-purple-600" />
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI Invoice Generator
            </DialogTitle>
            <DialogDescription>
              Select a worker to generate an AI-powered invoice based on their approved submissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="aiWorker">Select Worker</Label>
                <Select onValueChange={(userId) => {
                  const worker = users.find(u => u.id === userId);
                  if (worker) setSelectedWorker(worker);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(user => user.role === 'Worker').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aiMonth">Month</Label>
                <Input
                  id="aiMonth"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            {selectedWorker ? (
              <AIInvoiceGenerator
                isOpen={true}
                onClose={() => {}}
                worker={selectedWorker}
                workOrders={workOrders}
                selectedMonth={selectedMonth}
              />
            ) : (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Worker</h3>
                <p className="text-gray-500">Choose a worker to generate an AI-powered invoice</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
