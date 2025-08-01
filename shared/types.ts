export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SuperAdmin' | 'Admin' | 'Worker';
  profilePhoto?: string;
  whatsappNumber?: string;
  companyId?: string; // For multi-tenancy
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  plan: string;
  maxUsers: number;
  currentUsers: number;
  createdAt: string;
  isActive: boolean;
  databaseUrl?: string; // For separate database per company
}

export interface WorkOrder {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Under QA' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Deleted' | 'Stopped' | 'Done';
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  payRate?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentUrls?: string[];
  attachmentNames?: string[];
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
  whatsappNumber?: string;
}

export interface DashboardStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  ordersInQA: number;
  totalOrders: number;
  thisMonthSubmissions: number;
  pendingInvoices: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  readBy: string[]; // Array of user IDs who have read the message
}

export interface ChatConversation {
  id: string;
  name?: string; // For group chats
  isGroup: boolean;
  participantIds: string[];
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  lastActivity: string;
  createdBy?: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  receiverId?: string; // For direct messages
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CreateGroupChatRequest {
  name: string;
  participantIds: string[];
}
