import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ClipboardList, 
  Calendar, 
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Folder,
  Building
} from 'lucide-react';
import { WorkOrder } from '@shared/types';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    folderName: '',
    businessName: '',
    workCategory: '',
    totalSubmissions: '',
    submissionDate: '',
    description: '',
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

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
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`/api/work-orders/worker/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let submissionFileUrl = '';

      // Upload file if provided
      if (submissionFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', submissionFile);

        const uploadResponse = await fetch('/api/upload/work-order-file', {
          method: 'POST',
          body: fileFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          submissionFileUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/work-orders/worker-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedBy: user?.id,
          submittedByName: user?.name,
          submissionFileUrl,
          submissionFileName: submissionFile?.name || '',
        }),
      });

      if (response.ok) {
        fetchMyOrders();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting order:', error);
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
    });
    setSubmissionFile(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Under QA': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'In Progress': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Completed': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Under QA'];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const assignedOrders = orders.filter(order => order.assignedTo === user?.id);
  const submittedOrders = orders.filter(order => order.createdBy === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600 mt-1">View assigned orders and submit new work</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Submit Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit New Work Order</DialogTitle>
              <DialogDescription>Submit your completed work for review</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Describe the work completed..."
                />
              </div>

              <div>
                <Label htmlFor="submissionFile">Upload File</Label>
                <Input
                  id="submissionFile"
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xlsx,.zip,.rar"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX, XLSX, ZIP, RAR
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Order</Button>
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
                <p className="text-sm font-medium text-gray-600">Assigned Orders</p>
                <p className="text-2xl font-bold text-blue-600">{assignedOrders.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted Orders</p>
                <p className="text-2xl font-bold text-green-600">{submittedOrders.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {orders.filter(order => order.status === 'Approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Orders */}
      {assignedOrders.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assigned Orders
            </CardTitle>
            <CardDescription>
              Orders assigned to you by the administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-gray-400" />
                          <p className="font-medium">{order.title}</p>
                        </div>
                        <p className="text-sm text-gray-500">{order.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'No deadline'}
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
                        <span className="text-gray-400 text-sm">No files attached</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Orders */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Submitted Orders
          </CardTitle>
          <CardDescription>
            Orders you have submitted for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submittedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <p className="font-medium">{order.title}</p>
                        </div>
                        <p className="text-sm text-gray-500">{order.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submitted orders yet</h3>
              <p className="text-gray-500 mb-4">Start by submitting your first work order</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Work Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
