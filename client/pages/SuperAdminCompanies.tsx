import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Edit,
  Trash2,
  Building,
  Users,
  Activity,
  TrendingUp,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Company } from '@shared/types';

export default function SuperAdminCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyStats, setCompanyStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    maxCapacity: 0
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    plan: '',
    maxUsers: ''
  });

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchCompanies();
      fetchCompanyStats();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const response = await fetch('/api/companies/stats');
      if (response.ok) {
        const data = await response.json();
        setCompanyStats(data);
      }
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const response = await fetch(`/api/companies?userId=${user?.id}&userName=${user?.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCompanies();
        await fetchCompanyStats();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}?userId=${user?.id}&userName=${user?.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCompanies();
        await fetchCompanyStats();
        setIsEditDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${companyId}?userId=${user?.id}&userName=${user?.name}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCompanies();
        await fetchCompanyStats();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      plan: '',
      maxUsers: ''
    });
    setSelectedCompany(null);
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      address: company.address,
      phoneNumber: company.phoneNumber,
      plan: company.plan,
      maxUsers: company.maxUsers.toString()
    });
    setIsEditDialogOpen(true);
  };

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Company Management</h2>
          <p className="text-gray-600 mt-1">Manage all companies in the MT Web Experts SaaS platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>Add a new company to the platform with their details and pricing plan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="plan">Pricing Plan</Label>
                <Select onValueChange={(value) => setFormData({...formData, plan: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic - $99/month</SelectItem>
                    <SelectItem value="Professional">Professional - $199/month</SelectItem>
                    <SelectItem value="Enterprise">Enterprise - $399/month</SelectItem>
                    <SelectItem value="Custom">Custom Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
                  placeholder="Enter maximum number of users"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCompany} className="flex-1">Create Company</Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Companies</p>
                <p className="text-3xl font-bold mt-1">{companyStats.totalCompanies}</p>
              </div>
              <Building className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Companies</p>
                <p className="text-3xl font-bold mt-1">{companyStats.activeCompanies}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-1">{companyStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Capacity Usage</p>
                <p className="text-3xl font-bold mt-1">{Math.round((companyStats.totalUsers / Math.max(companyStats.maxCapacity, 1)) * 100)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            All Companies
          </CardTitle>
          <CardDescription>Manage all companies and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {company.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <Badge variant="outline">{company.plan}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {company.currentUsers} / {company.maxUsers}
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full" 
                          style={{ width: `${(company.currentUsers / company.maxUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.isActive ? "default" : "secondary"}>
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(company)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company details and settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Company Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-plan">Pricing Plan</Label>
              <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic - $99/month</SelectItem>
                  <SelectItem value="Professional">Professional - $199/month</SelectItem>
                  <SelectItem value="Enterprise">Enterprise - $399/month</SelectItem>
                  <SelectItem value="Custom">Custom Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-maxUsers">Maximum Users</Label>
              <Input
                id="edit-maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateCompany} className="flex-1">Update Company</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
