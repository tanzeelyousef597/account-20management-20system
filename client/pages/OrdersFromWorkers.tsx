import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';
import ApprovedOrders from './ApprovedOrders';
import RejectedOrders from './RejectedOrders';
import DeletedOrders from './DeletedOrders';

export default function OrdersFromWorkers() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState({
    folderName: '',
    businessName: '',
    workCategory: '',
    totalSubmissions: '',
    submissionDate: '',
    description: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileDownload = async (url: string, filename: string) => {
    try {
      console.log('Starting download for:', url, filename);
      
      // For local API endpoints, fetch directly
      if (url.startsWith('/api/download/')) {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          
          // Create a temporary URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          console.log('Download completed successfully');
          return;
        }
      }
      
      // For external URLs or fallback, create a simple text file for demo
      const content = `MT Web Experts - Work Order File\n\nFilename: ${filename}\nGenerated: ${new Date().toISOString()}\n\nThis is a sample file for demonstration purposes.\nIn production, this would be the actual uploaded file content.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename.endsWith('.txt') ? filename : filename.replace(/\.[^/.]+$/, '') + '.txt';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      console.log('Fallback download completed');
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
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
        console.log('All work orders fetched:', data);
        console.log('Worker submissions (non-admin):', data.filter((order: WorkOrder) => order.createdBy !== 'admin'));
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

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this worker submission? This action cannot be undone.')) {
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

  const openEditDialog = (order: WorkOrder) => {
    setSelectedOrder(order);
    setFormData({
      folderName: order.title,
      businessName: '',
      workCategory: order.category,
      totalSubmissions: order.payRate?.toString() || '',
      submissionDate: order.dueDate || '',
      description: order.description,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      folderName: '',
      businessName: '',
      workCategory: '',
      totalSubmissions: '',
      submissionDate: '',
      description: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Under QA': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Deleted': 'bg-gray-100 text-gray-800',
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

  // Filter for Under QA orders with search
  const underQAOrders = useMemo(() => {
    let filtered = workOrders.filter(order =>
      order.createdBy !== 'admin' && order.status === 'Under QA'
    );

    console.log('Filtered worker orders (Under QA):', filtered);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.title?.toLowerCase().includes(query) ||
        order.description?.toLowerCase().includes(query) ||
        order.category?.toLowerCase().includes(query) ||
        users.find(user => user.id === order.createdBy)?.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [workOrders, users, searchQuery]);

  // Pagination logic for Under QA tab
  const totalPages = Math.ceil(underQAOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = underQAOrders.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders from Workers</h2>
          <p className="text-gray-600 mt-1">All submissions from workers with organized status tabs</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders by title, description, category, worker, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-yellow-600 font-medium text-sm">Under QA</p>
                <p className="text-xl font-bold text-yellow-800">{underQAOrders.length}</p>
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
                <p className="text-xl font-bold text-green-800">{workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-600 font-medium text-sm">Rejected</p>
                <p className="text-xl font-bold text-red-800">{workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Trash2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm">Deleted</p>
                <p className="text-xl font-bold text-gray-800">{workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Deleted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="under-qa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl shadow-sm border border-slate-200">
          <TabsTrigger
            value="under-qa"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <span className="relative z-10 text-xs sm:text-sm">Under QA</span>
            <span className="bg-amber-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {underQAOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-emerald-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <span className="relative z-10 text-xs sm:text-sm">Approved</span>
            <span className="bg-emerald-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Approved').length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-400 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <span className="relative z-10 text-xs sm:text-sm">Rejected</span>
            <span className="bg-red-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Rejected').length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="deleted"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-400 data-[state=active]:to-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <span className="relative z-10 text-xs sm:text-sm">Deleted</span>
            <span className="bg-gray-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {workOrders.filter(o => o.createdBy !== 'admin' && o.status === 'Deleted').length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="under-qa">
          <Card className="shadow-lg bg-gradient-to-br from-white to-amber-50/30 border border-amber-200/50 backdrop-blur-sm">
            <CardHeader className="border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-2 rounded-lg shadow-sm">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-700 font-semibold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">Under QA - Pending Review</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Worker submissions pending review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paginatedOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Details</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
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
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {users.find(user => user.id === order.createdBy)?.name || 'Unknown Worker'}
                            </div>
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
                                  onClick={() => handleStatusChange(order.id, 'Deleted')}
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
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, underQAOrders.length)} of {underQAOrders.length} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                            if (page > totalPages) return null;
                            
                            return (
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending submissions</h3>
                  <p className="text-gray-500">Worker submissions pending review will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <ApprovedOrders
            workOrders={workOrders}
            users={users}
            onStatusChange={handleStatusChange}
            onDeleteOrder={(orderId) => handleStatusChange(orderId, 'Deleted')}
            onFileDownload={handleFileDownload}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedOrders
            workOrders={workOrders}
            users={users}
            onStatusChange={handleStatusChange}
            onDeleteOrder={(orderId) => handleStatusChange(orderId, 'Deleted')}
            onFileDownload={handleFileDownload}
          />
        </TabsContent>
        
        <TabsContent value="deleted">
          <DeletedOrders 
            workOrders={workOrders}
            users={users}
            onStatusChange={handleStatusChange}
            onDeleteOrder={handleDeleteOrder}
            onFileDownload={handleFileDownload}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Worker Submission</DialogTitle>
            <DialogDescription>Update the worker submission details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
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
