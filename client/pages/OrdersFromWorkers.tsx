import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

export default function OrdersFromWorkers() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Under QA': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
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

  // Filter orders from workers
  const workerOrders = workOrders.filter(order => 
    order.createdBy !== 'admin' && order.status === 'Under QA'
  );

  // Pagination logic
  const totalPages = Math.ceil(workerOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = workerOrders.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders from Workers</h2>
          <p className="text-gray-600 mt-1">Submissions from workers pending review and approval</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-yellow-600 font-medium">Pending Worker Submissions</p>
              <p className="text-2xl font-bold text-yellow-800">{workerOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-yellow-600" />
            Orders from Workers
          </CardTitle>
          <CardDescription>
            Submissions from workers pending review and approval
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
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Approved')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Rejected')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, workerOrders.length)} of {workerOrders.length} entries
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
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No worker submissions</h3>
              <p className="text-gray-500">Worker submissions will appear here for review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
