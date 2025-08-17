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
      console.log('Worker download starting for:', { url, filename });

      // Validate URL
      if (!url || url.trim() === '') {
        console.error('Empty or invalid URL provided:', url);
        alert('Invalid file URL. Cannot download file.');
        return;
      }

      // For local API endpoints, fetch directly
      if (url.startsWith('/api/download/')) {
        console.log('Worker fetching from local API endpoint:', url);

        const response = await fetch(url);
        console.log('Worker download response status:', response.status, response.statusText);

        if (response.ok) {
          const blob = await response.blob();
          console.log('Worker blob created, size:', blob.size, 'type:', blob.type);

          if (blob.size === 0) {
            console.error('Downloaded file is empty');
            alert('Downloaded file is empty. Please check if the file exists.');
            return;
          }

          // Create a temporary URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary anchor element and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename || 'download';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          console.log('Worker download completed successfully for file:', filename);
          alert(`File "${filename}" downloaded successfully!`);
          return;
        } else {
          const errorText = await response.text();
          console.error('Worker download failed with status:', response.status, 'Error:', errorText);
          alert(`Download failed: ${response.status} - ${errorText || 'Unknown error'}`);
          return;
        }
      }

      // For external URLs, try direct download first
      if (url.startsWith('http')) {
        console.log('Worker attempting direct download for external URL:', url);
        try {
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            console.log('Worker external URL download completed successfully');
            alert(`File "${filename}" downloaded successfully!`);
            return;
          }
        } catch (externalError) {
          console.log('Worker external download failed, falling back to demo content:', externalError);
        }
      }

      // Fallback: create a demo file
      console.log('Worker creating fallback demo file for:', filename);
      const content = `MT Web Experts - Work Order File\n\nOriginal Filename: ${filename}\nDownload Date: ${new Date().toLocaleString()}\nStatus: Fallback Demo File\n\nNote: This is a demonstration file. The original file could not be downloaded.\nPossible reasons:\n- File not found on server\n- Network connectivity issues\n- File permissions\n\nPlease contact support if this issue persists.`;

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
      console.log('Worker fallback download completed');
      alert(`Demo file created for "${filename}". Original file could not be downloaded.`);

    } catch (error) {
      console.error('Worker download failed with error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
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
      console.log('Starting worker submission...');
      let submissionFileUrl = '';

      // Upload file if provided
      if (submissionFile) {
        console.log('Uploading file:', submissionFile.name, 'Size:', submissionFile.size);
        const fileFormData = new FormData();
        fileFormData.append('file', submissionFile);

        const uploadResponse = await fetch('/api/upload/work-order-file', {
          method: 'POST',
          body: fileFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          submissionFileUrl = uploadData.url;
          console.log('File uploaded successfully:', uploadData);
        } else {
          const errorText = await uploadResponse.text();
          console.error('File upload failed:', errorText);
          alert('File upload failed: ' + errorText);
          return;
        }
      }

      console.log('Submitting work order with data:', {
        ...formData,
        submittedBy: user?.id,
        submittedByName: user?.name,
        submissionFileUrl,
        submissionFileName: submissionFile?.name || '',
      });

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
        const result = await response.json();
        console.log('Work order submitted successfully:', result);
        alert('Work order submitted successfully! It will appear in the admin\'s "Orders from Workers" section for review.');
        fetchMyOrders();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        const errorText = await response.text();
        console.error('Work order submission failed:', errorText);
        alert('Work order submission failed: ' + errorText);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const getWorkerStatusBadge = (order: WorkOrder, isAssigned: boolean) => {
    // For assigned orders, workers only see "Assigned" regardless of admin status changes
    if (isAssigned && order.assignedTo === user?.id) {
      // Only show different status if order is clearly completed/rejected
      if (order.status === 'Rejected') {
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      } else if (order.status === 'Done') {
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      } else {
        // All other statuses show as "Assigned" to worker
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        );
      }
    }

    // For submitted orders, show actual status
    const statusConfig = {
      'Under QA': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'In Progress': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Completed': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      'Done': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
    };

    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig['Under QA'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {order.status}
      </Badge>
    );
  };

  const assignedOrders = orders.filter(order => order.assignedTo === user?.id);
  const submittedOrders = orders.filter(order => order.createdBy === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700">My Orders</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">View assigned orders and submit new work</p>
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
                      {getWorkerStatusBadge(order, assignedOrders.includes(order))}
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
                      {getWorkerStatusBadge(order, assignedOrders.includes(order))}
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
