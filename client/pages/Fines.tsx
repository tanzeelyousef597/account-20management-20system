import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  AlertCircle,
  DollarSign,
  User,
  Calendar,
  TrendingDown,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Fine, User as UserType } from '@shared/types';
import { api } from '@shared/api-client';

export default function Fines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const { formatAmount, currency } = useCurrency();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [formData, setFormData] = useState({
    workerId: '',
    amount: '',
    reason: '',
  });

  useEffect(() => {
    fetchFines();
    fetchUsers();
  }, []);

  const fetchFines = async () => {
    try {
      const data = await api.getFines();
      setFines(data);
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.filter((user: UserType) => user.role === 'Worker'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId) return;

    const selectedUser = users.find(u => u.id === formData.workerId);
    if (!selectedUser) return;

    try {
      await api.createFine({
        workerId: formData.workerId,
        workerName: selectedUser.name,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
      });

      fetchFines();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating fine:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      workerId: '',
      amount: '',
      reason: '',
    });
  };

  const openEditDialog = (fine: Fine) => {
    setSelectedFine(fine);
    setFormData({
      workerId: fine.workerId,
      amount: fine.amount.toString(),
      reason: fine.reason,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine || !formData.workerId) return;

    const selectedUser = users.find(u => u.id === formData.workerId);
    if (!selectedUser) return;

    try {
      await api.updateFine(selectedFine.id, {
        workerId: formData.workerId,
        workerName: selectedUser.name,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
      });

      fetchFines();
      setIsEditDialogOpen(false);
      setSelectedFine(null);
      resetForm();
    } catch (error) {
      console.error('Error updating fine:', error);
    }
  };

  const handleDeleteFine = async (fineId: string) => {
    if (window.confirm('Are you sure you want to delete this fine?')) {
      try {
        await api.deleteFine(fineId);
        fetchFines();
      } catch (error) {
        console.error('Error deleting fine:', error);
      }
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Remove local formatCurrency function - using global currency context

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fine Management</h2>
          <p className="text-gray-600 mt-1">Manage and track worker fines</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Fine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Fine</DialogTitle>
              <DialogDescription>Issue a fine to a worker</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFine} className="space-y-4">
              <div>
                <Label htmlFor="worker">Assign User</Label>
                <Select value={formData.workerId} onValueChange={(value) => setFormData({...formData, workerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.profilePhoto} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Reason for fine..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.workerId}>
                  Add Fine
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-gray-900">{fines.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(fines.reduce((sum, fine) => sum + fine.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fines.filter(fine => 
                    new Date(fine.createdAt).getMonth() === new Date().getMonth() &&
                    new Date(fine.createdAt).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fines Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            All Fines
          </CardTitle>
          <CardDescription>
            View all issued fines and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fines.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Worker</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Reason</TableHead>
                  <TableHead className="whitespace-nowrap">Date Issued</TableHead>
                  <TableHead className="whitespace-nowrap">Issued By</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(fine.workerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{fine.workerName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            ID: {fine.workerId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatAmount(fine.amount)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs" title={fine.reason}>
                        {fine.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(fine.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{fine.createdBy}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No fines yet</h3>
              <p className="text-gray-500 mb-4">No fines have been issued to workers</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
