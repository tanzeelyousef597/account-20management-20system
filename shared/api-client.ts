/**
 * API client utility for making HTTP requests
 * Handles base URL configuration and error handling
 */

// Get the API base URL based on environment
function getApiBaseUrl(): string {
  // In development, use relative URLs which will be proxied by Vite
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return `${window.location.protocol}//${window.location.host}`;
  }
  // Server-side fallback
  return '';
}

// API client class
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Export a default instance
export const apiClient = new ApiClient();

// Export individual API functions for common operations
export const api = {
  // Users
  getUsers: () => apiClient.get('/api/users'),
  createUser: (data: any) => apiClient.post('/api/users', data),
  updateUser: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),

  // Work Orders
  getWorkOrders: () => apiClient.get('/api/work-orders'),
  createWorkOrder: (data: any) => apiClient.post('/api/work-orders', data),
  updateWorkOrder: (id: string, data: any) => apiClient.put(`/api/work-orders/${id}`, data),
  deleteWorkOrder: (id: string) => apiClient.delete(`/api/work-orders/${id}`),

  // Invoices
  getInvoices: () => apiClient.get('/api/invoices'),
  getWorkerInvoices: (workerId: string) => apiClient.get(`/api/invoices/worker/${workerId}`),
  createInvoice: (data: any) => apiClient.post('/api/invoices', data),

  // Bonuses
  getBonuses: () => apiClient.get('/api/bonuses'),
  getWorkerBonuses: (workerId: string) => apiClient.get(`/api/bonuses/worker/${workerId}`),
  createBonus: (data: any) => apiClient.post('/api/bonuses', data),

  // Fines
  getFines: () => apiClient.get('/api/fines'),
  getWorkerFines: (workerId: string) => apiClient.get(`/api/fines/worker/${workerId}`),
  createFine: (data: any) => apiClient.post('/api/fines', data),

  // Dashboard
  getDashboardData: (month?: string) => apiClient.get(`/api/dashboard/data${month ? `?month=${month}` : ''}`),
  getWorkerDashboardData: (workerId: string, month?: string) => 
    apiClient.get(`/api/dashboard/worker/${workerId}${month ? `?month=${month}` : ''}`),

  // Activity Logs
  getActivityLogs: () => apiClient.get('/api/activity-logs'),

  // Auth
  login: (credentials: any) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
};
