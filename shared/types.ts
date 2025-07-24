export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Worker';
  profilePhoto?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Under QA' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  payRate?: number;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface Invoice {
  id: string;
  workerId: string;
  workerName: string;
  month: string;
  year: number;
  submissionCount: number;
  fixedPay: number;
  workPay: number;
  fine: number;
  bonus: number;
  totalAmount: number;
  generatedAt: string;
  isManual: boolean;
}

export interface Bonus {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  reason: string;
  month: string;
  year: number;
  createdBy: string;
  createdAt: string;
}

export interface Fine {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'login' | 'logout' | 'order_created' | 'order_updated' | 'user_created' | 'invoice_generated' | 'bonus_added' | 'fine_issued';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'Admin' | 'Worker';
  profilePhoto?: string;
}

export interface DashboardStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  ordersInQA: number;
  totalOrders: number;
  thisMonthSubmissions: number;
  pendingInvoices: number;
}
