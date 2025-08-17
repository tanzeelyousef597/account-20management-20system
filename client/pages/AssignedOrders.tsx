import { useState, useEffect, useRef, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trash2,
  ChevronDown,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Search,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  CheckCheck
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

export default function AssignedOrders() {
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
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleFileDownload = async (url: string, filename: string) => {
    try {
      console.log('Starting download for:', { url, filename });

      // Validate URL
      if (!url || url.trim() === '') {
        console.error('Empty or invalid URL provided:', url);
        alert('Invalid file URL. Cannot download file.');
        return;
      }

      // For local API endpoints, fetch directly
      if (url.startsWith('/api/download/')) {
        console.log('Fetching from local API endpoint:', url);

        const response = await fetch(url);
        console.log('Download response status:', response.status, response.statusText);

        if (response.ok) {
          const blob = await response.blob();
          console.log('Blob created, size:', blob.size, 'type:', blob.type);

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
          console.log('Download completed successfully for file:', filename);
          alert(`File "${filename}" downloaded successfully!`);
          return;
        } else {
          const errorText = await response.text();
          console.error('Download failed with status:', response.status, 'Error:', errorText);
          alert(`Download failed: ${response.status} - ${errorText || 'Unknown error'}`);
          return;
        }
      }

      // For external URLs, try direct download first
      if (url.startsWith('http')) {
        console.log('Attempting direct download for external URL:', url);
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
            console.log('External URL download completed successfully');
            alert(`File "${filename}" downloaded successfully!`);
            return;
          }
        } catch (externalError) {
          console.log('External download failed, falling back to demo content:', externalError);
        }
      }

      // Fallback: create a demo file
      console.log('Creating fallback demo file for:', filename);
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
      console.log('Fallback download completed');
      alert(`Demo file created for "${filename}". Original file could not be downloaded.`);

    } catch (error) {
      console.error('Download failed with error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
    }
  };

  const handleDebugFiles = async () => {
    try {
      const response = await fetch('/api/debug/files');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
        setShowDebug(true);
        console.log('Debug file info:', data);
      } else {
        const errorText = await response.text();
        alert(`Debug request failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Debug request error:', error);
      alert('Debug request failed');
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssignPopoverOpen(false);
      }
    };

    if (isAssignPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAssignPopoverOpen]);

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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setUploadProgress('');

    try {
      let attachmentUrls: string[] = [];
      let attachmentNames: string[] = [];

      // Upload files if provided
      if (attachmentFiles.length > 0) {
        setIsUploading(true);
        setUploadProgress(`Uploading ${attachmentFiles.length} file(s)...`);

        for (let i = 0; i < attachmentFiles.length; i++) {
          const file = attachmentFiles[i];
          setUploadProgress(`Uploading file ${i + 1} of ${attachmentFiles.length}: ${file.name}`);

          // For large files (like ZIP), show progress
          if (file.size > 10 * 1024 * 1024) { // > 10MB
            setUploadProgress(`Uploading large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
          }

          const fileFormData = new FormData();
          fileFormData.append('file', file);
          fileFormData.append('fileName', file.name);

          const uploadResponse = await fetch('/api/upload/work-order-file', {
            method: 'POST',
            body: fileFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            attachmentUrls.push(uploadData.url);
            attachmentNames.push(file.name);
          } else {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
        }
        setIsUploading(false);
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
        // Create separate order for each assigned worker - set status to "In Progress"
        for (const workerId of formData.assignedTo) {
          const response = await fetch('/api/work-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              assignedTo: workerId,
              status: 'In Progress', // Orders go to "Orders in Work" tab
              attachmentUrls,
              attachmentNames,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to create order for worker ${workerId}`);
          }
        }
      }

      setUploadProgress('Creating work orders...');

      fetchWorkOrders();
      setIsCreateDialogOpen(false);
      resetForm();
      setUploadProgress('Work orders created successfully!');
    } catch (error) {
      console.error('Error creating work order:', error);
      setUploadProgress('Error creating work order. Please try again.');
    } finally {
      setIsCreating(false);
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
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
    setIsAssignPopoverOpen(false);
    setIsCreating(false);
    setIsUploading(false);
    setUploadProgress('');
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
      assignedTo: [],
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Under QA': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Stopped': 'bg-gray-100 text-gray-800',
      'Done': 'bg-purple-100 text-purple-800',
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
      case 'In Progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'Stopped': return <StopCircle className="h-4 w-4 text-gray-600" />;
      case 'Done': return <CheckCheck className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  // Filter orders for different tabs with search
  const getFilteredOrders = (statusFilter: string[]) => {
    let filtered = workOrders.filter(order => 
      order.assignedTo && statusFilter.includes(order.status)
    );
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.title?.toLowerCase().includes(query) ||
        order.description?.toLowerCase().includes(query) ||
        order.category?.toLowerCase().includes(query) ||
        order.assignedToName?.toLowerCase().includes(query) ||
        order.status?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const ordersInWork = getFilteredOrders(['In Progress', 'Under QA']);
  const approvedOrders = getFilteredOrders(['Approved']);
  const stoppedOrders = getFilteredOrders(['Stopped']);
  const doneOrders = getFilteredOrders(['Done']);

  // Pagination logic
  const getPaginatedOrders = (orders: WorkOrder[]) => {
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);
    return { paginatedOrders, totalPages, startIndex };
  };

  const goToPage = (page: number, totalPages: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderOrdersTable = (orders: WorkOrder[], tabType: string) => {
    const { paginatedOrders, totalPages, startIndex } = getPaginatedOrders(orders);

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {paginatedOrders.map((order, index) => (
            <Card
              key={order.id}
              className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <CardContent className="p-4 relative z-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-700 truncate" title={order.title}>{order.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{order.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 text-xs font-medium">Category</span>
                        <p className="text-slate-700 truncate">{order.category}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs font-medium">Assigned To</span>
                        <p className="text-slate-700 truncate">{order.assignedToName || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 text-xs font-medium">Created</span>
                        <p className="text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs font-medium">Files</span>
                        <p className="text-slate-700">{order.attachmentUrls?.length || 0} files</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex gap-2">
                      {order.attachmentUrls && order.attachmentUrls.length > 0 && (
                        <Button variant="outline" size="sm" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Files ({order.attachmentUrls.length})
                        </Button>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/60 rounded-lg shadow-sm backdrop-blur-sm">
          <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-100/30 backdrop-blur-sm">
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">Order Details</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">Assigned To</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">Status</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent hidden xl:table-cell">Files</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-slate-700 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow
                key={order.id}
                className="border-slate-100/50 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell className="min-w-48">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-700 truncate" title={order.title}>{order.title}</p>
                    <p className="text-sm text-slate-500 truncate" title={order.description}>{order.description}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline" className="text-slate-600 border-slate-300">{order.category}</Badge>
                </TableCell>
                <TableCell>
                  {order.assignedToName ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate text-slate-700" title={order.assignedToName}>{order.assignedToName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  {(order.attachmentUrls && order.attachmentUrls.length > 0) || order.attachmentUrl ? (
                    <div className="space-y-1">
                      {order.attachmentUrls && order.attachmentUrls.length > 0 ? (
                        order.attachmentUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              onClick={() => handleFileDownload(url, order.attachmentNames?.[index] || `attachment-${index + 1}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
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
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
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
                  <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
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
                      {tabType === 'work' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Stopped')}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Done')}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark Done
                          </DropdownMenuItem>
                        </>
                      )}
                      {tabType === 'approved' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Stopped')}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Done')}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark Done
                          </DropdownMenuItem>
                        </>
                      )}
                      {tabType === 'stopped' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'In Progress')}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Resume Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Done')}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark Done
                          </DropdownMenuItem>
                        </>
                      )}
                      {tabType === 'done' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'In Progress')}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Resume Order
                          </DropdownMenuItem>
                        </>
                      )}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, orders.length)} of {orders.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1, totalPages)}
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
                      onClick={() => goToPage(page, totalPages)}
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
                onClick={() => goToPage(currentPage + 1, totalPages)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700">
            Assigned Orders
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Manage orders through their workflow stages
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0">
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
                  <Label htmlFor="assignedTo">Assign Users (Required)</Label>
                  <div className="relative" ref={dropdownRef}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between font-normal"
                      type="button"
                      onClick={() => setIsAssignPopoverOpen(!isAssignPopoverOpen)}
                    >
                      {formData.assignedTo.length > 0 
                        ? `${formData.assignedTo.length} worker${formData.assignedTo.length > 1 ? 's' : ''} selected`
                        : "Select workers..."
                      }
                      <ChevronDown className={`ml-2 h-4 w-4 opacity-50 transition-transform ${isAssignPopoverOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {isAssignPopoverOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-3">Select Workers</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {users.filter(user => user.role === 'Worker').length > 0 ? (
                              users.filter(user => user.role === 'Worker').map((user) => (
                                <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                     onClick={() => {
                                       const isSelected = formData.assignedTo.includes(user.id);
                                       if (isSelected) {
                                         setFormData({
                                           ...formData,
                                           assignedTo: formData.assignedTo.filter(id => id !== user.id)
                                         });
                                       } else {
                                         setFormData({
                                           ...formData,
                                           assignedTo: [...formData.assignedTo, user.id]
                                         });
                                       }
                                     }}>
                                  <input
                                    type="checkbox"
                                    checked={formData.assignedTo.includes(user.id)}
                                    onChange={() => {}} // Controlled by parent div onClick
                                    className="rounded border-gray-300"
                                  />
                                  <label className="text-sm font-medium cursor-pointer flex-1">
                                    {user.name}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No workers available</p>
                            )}
                          </div>
                          {formData.assignedTo.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({...formData, assignedTo: []});
                                }}
                                className="w-full"
                                type="button"
                              >
                                Clear all selections
                              </Button>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setIsAssignPopoverOpen(false)}
                              className="w-full"
                              type="button"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Orders will be created with "In Progress" status and go to "Orders in Work" tab.
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
                  placeholder="Describe the work requirements..."
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
              
              {/* Upload Progress */}
              {(isUploading || uploadProgress) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {isUploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    <span className="text-sm text-blue-700 font-medium">{uploadProgress}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formData.assignedTo.length === 0 || isCreating || isUploading}
                  className="relative"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="bg-gradient-to-r from-white to-slate-50/50 border border-slate-200/60 shadow-md backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-30 rounded-lg transition-opacity duration-200"></div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 z-10 transition-colors duration-200 group-focus-within:text-blue-500" />
            <Input
              placeholder="Search orders by title, description, category, worker, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white relative z-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="work" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl shadow-sm border border-slate-200">
          <TabsTrigger
            value="work"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <PlayCircle className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Orders in Work</span>
            <span className="sm:hidden relative z-10">Work</span>
            <span className="bg-blue-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {ordersInWork.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="stopped"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <StopCircle className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Stopped Orders</span>
            <span className="sm:hidden relative z-10">Stopped</span>
            <span className="bg-amber-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {stoppedOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="done"
            className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-emerald-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
            <CheckCheck className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Done Orders</span>
            <span className="sm:hidden relative z-10">Done</span>
            <span className="bg-emerald-100 data-[state=active]:bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium relative z-10 transition-colors duration-200">
              {doneOrders.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work">
          <Card className="shadow-lg bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/50 backdrop-blur-sm">
            <CardHeader className="border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg shadow-sm">
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-700 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Orders in Work</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Orders currently in progress or under QA
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-transparent to-blue-50/20">
              {ordersInWork.length > 0 ? (
                renderOrdersTable(ordersInWork, 'work')
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-full w-fit mx-auto mb-4">
                    <PlayCircle className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No orders in work</h3>
                  <p className="text-slate-500 mb-4">Assign new orders to workers to get started</p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="stopped">
          <Card className="shadow-lg bg-gradient-to-br from-white to-amber-50/30 border border-amber-200/50 backdrop-blur-sm">
            <CardHeader className="border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-2 rounded-lg shadow-sm">
                  <StopCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-700 font-semibold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">Stopped Orders</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Orders that have been stopped or paused
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-transparent to-amber-50/20">
              {stoppedOrders.length > 0 ? (
                renderOrdersTable(stoppedOrders, 'stopped')
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-4 rounded-full w-fit mx-auto mb-4">
                    <StopCircle className="h-12 w-12 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No stopped orders</h3>
                  <p className="text-slate-500">Stopped orders will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="done">
          <Card className="shadow-lg bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/50 backdrop-blur-sm">
            <CardHeader className="border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-2 rounded-lg shadow-sm">
                  <CheckCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-700 font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Done Orders</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Orders that have been completed and marked as done
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-transparent to-emerald-50/20">
              {doneOrders.length > 0 ? (
                renderOrdersTable(doneOrders, 'done')
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 p-4 rounded-full w-fit mx-auto mb-4">
                    <CheckCheck className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No done orders</h3>
                  <p className="text-slate-500">Completed orders marked as done will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>Update the work order details</DialogDescription>
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

      {/* Debug Info Display */}
      {showDebug && debugInfo && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <p><strong>Total Files in Storage:</strong> {debugInfo.totalFiles}</p>
          <div className="mt-2">
            <strong>Available Files:</strong>
            <ul className="list-disc list-inside mt-1">
              {debugInfo.files.map((file: any) => (
                <li key={file.id} className="text-sm">
                  {file.id} - {file.name} ({file.size} bytes)
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setShowDebug(false)}
            className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-sm"
          >
            Hide Debug Info
          </button>
        </div>
      )}
    </div>
  );
}
