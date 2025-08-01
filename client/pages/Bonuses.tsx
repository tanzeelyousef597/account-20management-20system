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
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  Gift,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Bonus, User as UserType } from '@shared/types';
import { api } from '@shared/api-client';

export default function Bonuses() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const { formatAmount, currency } = useCurrency();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState({
    workerId: '',
    amount: '',
    reason: '',
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    fetchBonuses();
    fetchUsers();
  }, []);

  const fetchBonuses = async () => {
    try {
      const data = await api.getBonuses();
      setBonuses(data);
    } catch (error) {
      console.error('Error fetching bonuses:', error);
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

  const handleCreateBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId) return;

    const selectedUser = users.find(u => u.id === formData.workerId);
    if (!selectedUser) return;

    try {
      await api.createBonus({
        workerId: formData.workerId,
        workerName: selectedUser.name,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        month: formData.month,
        year: new Date(formData.month).getFullYear(),
      });

      fetchBonuses();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating bonus:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      workerId: '',
      amount: '',
      reason: '',
      month: new Date().toISOString().slice(0, 7),
    });
  };

  const openEditDialog = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setFormData({
      workerId: bonus.workerId,
      amount: bonus.amount.toString(),
      reason: bonus.reason,
      month: bonus.month,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBonus || !formData.workerId) return;

    const selectedUser = users.find(u => u.id === formData.workerId);
    if (!selectedUser) return;

    try {
      await api.updateBonus(selectedBonus.id, {
        workerId: formData.workerId,
        workerName: selectedUser.name,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        month: formData.month,
        year: new Date(formData.month).getFullYear(),
      });

      fetchBonuses();
      setIsEditDialogOpen(false);
      setSelectedBonus(null);
      resetForm();
    } catch (error) {
      console.error('Error updating bonus:', error);
    }
  };

  const handleDeleteBonus = async (bonusId: string) => {
    if (window.confirm('Are you sure you want to delete this bonus?')) {
      try {
        await api.deleteBonus(bonusId);
        fetchBonuses();
      } catch (error) {
        console.error('Error deleting bonus:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Bonus Management</h2>
          <p className="text-gray-600 mt-1">Manage and track worker bonuses</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Bonus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bonus</DialogTitle>
              <DialogDescription>Award a bonus to a worker</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBonus} className="space-y-4">
              <div>
                <Label htmlFor="worker">Select Worker</Label>
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
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Reason for bonus..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.workerId}>
                  Add Bonus
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
                <p className="text-sm font-medium text-gray-600">Total Bonuses</p>
                <p className="text-2xl font-bold text-gray-900">{bonuses.length}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(bonuses.reduce((sum, bonus) => sum + bonus.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bonuses.filter(bonus => bonus.month === new Date().toISOString().slice(0, 7)).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonuses Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            All Bonuses
          </CardTitle>
          <CardDescription>
            View all awarded bonuses and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonuses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(bonus.workerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{bonus.workerName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            ID: {bonus.workerId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatAmount(bonus.amount)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {bonus.month} {bonus.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={bonus.reason}>
                        {bonus.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">
                        {new Date(bonus.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(bonus)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBonus(bonus.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bonuses yet</h3>
              <p className="text-gray-500 mb-4">Start rewarding your workers with bonuses</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bonus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
