import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

interface ApprovedOrdersProps {
  workOrders: WorkOrder[];
  users: UserType[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onFileDownload: (url: string, filename: string) => Promise<void>;
}

export default function ApprovedOrders({ 
  workOrders, 
  users, 
  onStatusChange, 
  onDeleteOrder, 
  onFileDownload 
}: ApprovedOrdersProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 100;

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
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  // Filter approved orders from workers
  const approvedOrders = useMemo(() => {
    let filtered = workOrders.filter(order => 
      order.createdBy !== 'admin' && order.status === 'Approved'
    );
    
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

  // Pagination logic
  const totalPages = Math.ceil(approvedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = approvedOrders.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search approved orders by title, description, category, or worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-green-600 font-medium">Approved Orders</p>
              <p className="text-2xl font-bold text-green-800">{approvedOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approved Orders
          </CardTitle>
          <CardDescription>
            Worker submissions that have been approved
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
                    <TableHead>Approved</TableHead>
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
                                    onClick={() => onFileDownload(url, order.attachmentNames?.[index] || `attachment-${index + 1}`)}
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
                                    onClick={() => onFileDownload(order.attachmentUrl, order.attachmentName || 'attachment')}
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
                          {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Rejected')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Move to Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteOrder(order.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Move to Deleted
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, approvedOrders.length)} of {approvedOrders.length} entries
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
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved orders</h3>
              <p className="text-gray-500">Approved worker submissions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
