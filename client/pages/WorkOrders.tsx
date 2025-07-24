import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Folder,
  Building,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState({
    folderName: '',
    businessName: '',
    workCategory: '',
    totalSubmissions: '',
    submissionDate: '',
    description: '',
    assignedTo: [] as string[],
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const handleFileDownload = async (url: string, filename: string) => {
    try {
      // Try fetch first for same-origin or CORS-enabled URLs
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (error) {
      console.warn('Fetch download failed, trying direct download:', error);
    }

    // Fallback: Try direct download with window.open
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Direct download also failed:', error);
      // Last resort: open in new tab
      window.open(url, '_blank');
    }
  };

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
        setUsers(data.filter((user: UserType) => user.role === 'Worker'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let attachmentUrls: string[] = [];
      let attachmentNames: string[] = [];

      // Upload files if provided
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);

          const uploadResponse = await fetch('/api/upload/work-order-file', {
            method: 'POST',
            body: fileFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            attachmentUrls.push(uploadData.url);
            attachmentNames.push(file.name);
          }
        }
      }

      // If no workers assigned, create one unassigned order
      if (formData.assignedTo.length === 0) {
        const response = await fetch('/api/work-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            assignedTo: '',
            attachmentUrls,
            attachmentNames,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create unassigned order');
        }
      } else {
        // Create separate order for each assigned worker
        for (const workerId of formData.assignedTo) {
          const response = await fetch('/api/work-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              assignedTo: workerId,
              attachmentUrls,
              attachmentNames,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create order for worker ${workerId}`);
          }
        }
      }

      fetchWorkOrders();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/work-orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchWorkOrders();
        setIsEditDialogOpen(false);
        setSelectedOrder(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/work-orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      try {
        const response = await fetch(`/api/work-orders/${orderId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchWorkOrders();
        }
      } catch (error) {
        console.error('Error deleting work order:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      folderName: '',
      businessName: '',
      workCategory: '',
      totalSubmissions: '',
      submissionDate: '',
      description: '',
      assignedTo: [],
    });
    setAttachmentFiles([]);
  };

  const openEditDialog = (order: WorkOrder) => {
    setSelectedOrder(order);
    setFormData({
      folderName: order.title, // Using title as folder name for now
      businessName: order.category, // Using category as business name for now
      workCategory: order.category,
      totalSubmissions: order.payRate?.toString() || '',
      submissionDate: order.dueDate || '',
      description: order.description,
      assignedTo: order.assignedTo || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Under QA': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Under QA': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-gray-600 mt-1">Manage and track all work orders</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>Fill in the details to create a new work order</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={formData.folderName}
                    onChange={(e) => setFormData({...formData, folderName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workCategory">Work Category</Label>
                  <Input
                    id="workCategory"
                    value={formData.workCategory}
                    onChange={(e) => setFormData({...formData, workCategory: e.target.value})}
                    placeholder="e.g., Content Writing, SEO, Link Building"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalSubmissions">Total Submissions</Label>
                  <Input
                    id="totalSubmissions"
                    type="number"
                    value={formData.totalSubmissions}
                    onChange={(e) => setFormData({...formData, totalSubmissions: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionDate">Submission Date</Label>
                  <Input
                    id="submissionDate"
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign Users (Optional)</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                    {users.filter(user => user.role === 'Worker').length > 0 ? (
                      users.filter(user => user.role === 'Worker').map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`worker-${user.id}`}
                            checked={formData.assignedTo.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedTo: [...formData.assignedTo, user.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedTo: formData.assignedTo.filter(id => id !== user.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`worker-${user.id}`} className="text-sm font-medium">
                            {user.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No workers available</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Select one or more workers. Leave unselected to create unassigned order.
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Add a description for this work order..."
                />
              </div>

              <div>
                <Label htmlFor="attachment">Attachments (Optional, Max 2GB per file)</Label>
                <Input
                  id="attachment"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachmentFiles(files);
                  }}
                  accept="*/*"
                />
                {attachmentFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        <span>{file.name}</span>
                        <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Work Orders Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Work Orders
          </CardTitle>
          <CardDescription>
            View and manage all submitted work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{order.title}</p>
                        <p className="text-sm text-gray-500">{order.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {order.assignedToName}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(order.attachmentUrls && order.attachmentUrls.length > 0) || order.attachmentUrl ? (
                        <div className="space-y-1">
                          {/* Show multiple files if available */}
                          {order.attachmentUrls && order.attachmentUrls.length > 0 ? (
                            order.attachmentUrls.map((url, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <button
                                  onClick={() => handleFileDownload(url, order.attachmentNames?.[index] || `attachment-${index + 1}`)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded text-xs font-medium transition-colors cursor-pointer"
                                >
                                  <FileText className="h-3 w-3" />
                                  {order.attachmentNames?.[index] || `File ${index + 1}`}
                                </button>
                              </div>
                            ))
                          ) : (
                            /* Show single file for backward compatibility */
                            order.attachmentUrl && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleFileDownload(order.attachmentUrl, order.attachmentName || 'attachment')}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                  <FileText className="h-4 w-4" />
                                  Download File
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No files</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(order)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Approved')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Rejected')}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(order.id)}
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
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders yet</h3>
              <p className="text-gray-500 mb-4">Create your first work order to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>Update the work order details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFolderName">Folder Name</Label>
                <Input
                  id="editFolderName"
                  value={formData.folderName}
                  onChange={(e) => setFormData({...formData, folderName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editBusinessName">Business Name</Label>
                <Input
                  id="editBusinessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editWorkCategory">Work Category</Label>
                <Input
                  id="editWorkCategory"
                  value={formData.workCategory}
                  onChange={(e) => setFormData({...formData, workCategory: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTotalSubmissions">Total Submissions</Label>
                <Input
                  id="editTotalSubmissions"
                  type="number"
                  value={formData.totalSubmissions}
                  onChange={(e) => setFormData({...formData, totalSubmissions: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editSubmissionDate">Submission Date</Label>
              <Input
                id="editSubmissionDate"
                type="date"
                value={formData.submissionDate}
                onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Add a description for this work order..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Order</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
