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
  Calculator
} from 'lucide-react';
import { Invoice, User as UserType } from '@shared/types';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
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

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // Auto-calculate final amount
    const fixed = parseFloat(formData.fixedPay) || 0;
    const work = parseFloat(formData.workPay) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const fine = parseFloat(formData.fine) || 0;
    
    const total = fixed + work + bonus - fine;
    setFormData(prev => ({
      ...prev,
      finalAmount: total.toString()
    }));
  }, [formData.fixedPay, formData.workPay, formData.bonus, formData.fine]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((user: UserType) => user.role === 'Worker'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        
        // Auto-populate some fields based on stats
        setFormData(prev => ({
          ...prev,
          fine: data.fines.toString(),
          bonus: data.bonuses.toString(),
        }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedUserId,
          workerName: selectedUser.name,
          month: formData.month,
          fixedPay: parseFloat(formData.fixedPay) || 0,
          workPay: parseFloat(formData.workPay) || 0,
          fine: parseFloat(formData.fine) || 0,
          bonus: parseFloat(formData.bonus) || 0,
          totalAmount: parseFloat(formData.finalAmount) || 0,
          submissionCount: userStats.approvedSubmissions,
          isManual: true,
        }),
      });
      
      if (response.ok) {
        fetchInvoices();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
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

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`);
    // In production, generate and download PDF/Excel file
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-gray-600 mt-1">Create and manage worker invoices</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Manual Invoice</DialogTitle>
              <DialogDescription>Generate an invoice for a worker with custom amounts</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="worker">Select Worker</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
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
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Worker Statistics
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Submissions</p>
                        <p className="font-bold text-blue-600">{userStats.totalSubmissions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Approved</p>
                        <p className="font-bold text-green-600">{userStats.approvedSubmissions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Fines</p>
                        <p className="font-bold text-red-600">PKR {userStats.fines}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Bonuses</p>
                        <p className="font-bold text-purple-600">PKR {userStats.bonuses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fixedPay">Fixed Pay (PKR)</Label>
                  <Input
                    id="fixedPay"
                    type="number"
                    value={formData.fixedPay}
                    onChange={(e) => setFormData({...formData, fixedPay: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="workPay">Work Pay (PKR)</Label>
                  <Input
                    id="workPay"
                    type="number"
                    value={formData.workPay}
                    onChange={(e) => setFormData({...formData, workPay: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fine">Fine Amount (PKR)</Label>
                  <Input
                    id="fine"
                    type="number"
                    value={formData.fine}
                    onChange={(e) => setFormData({...formData, fine: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="bonus">Bonus Amount (PKR)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Final Amount</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      PKR {formData.finalAmount || '0'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedUserId}>
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Invoices
          </CardTitle>
          <CardDescription>
            View and manage all generated invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Amount Breakdown</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Type</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {invoice.workerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {invoice.month} {invoice.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.submissionCount} submissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>Fixed: PKR {invoice.fixedPay}</div>
                        <div>Work: PKR {invoice.workPay}</div>
                        <div className="text-green-600">Bonus: PKR {invoice.bonus}</div>
                        <div className="text-red-600">Fine: PKR {invoice.fine}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          PKR {invoice.totalAmount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.isManual ? 'default' : 'secondary'}>
                        {invoice.isManual ? 'Manual' : 'Auto'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
