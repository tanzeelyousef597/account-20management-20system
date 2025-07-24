import { RequestHandler } from "express";

// Import work orders data to calculate dynamic stats
let workOrders: any[] = [];

// Function to update work orders reference
export const updateWorkOrdersReference = (orders: any[]) => {
  workOrders = orders;
};

export const handleDashboardStats: RequestHandler = (req, res) => {
  // Calculate dynamic statistics from actual work orders
  const stats = {
    totalSubmissions: workOrders.length,
    approvedSubmissions: workOrders.filter(order => order.status === 'Approved').length,
    ordersInQA: workOrders.filter(order => order.status === 'Under QA').length,
    totalOrders: workOrders.length,
    thisMonthSubmissions: workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }).length,
    pendingInvoices: 0, // Would be calculated from invoice data
  };

  res.json(stats);
};

export const handleDashboardData: RequestHandler = (req, res) => {
  const { month } = req.query;

  // Filter orders by month if specified
  let filteredOrders = workOrders;
  if (month) {
    const [year, monthNum] = month.toString().split('-');
    filteredOrders = workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === parseInt(year) &&
             (orderDate.getMonth() + 1) === parseInt(monthNum);
    });
  }

  // Calculate category statistics
  const categoryMap = new Map();
  filteredOrders.forEach(order => {
    const category = order.category || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const categories = Array.from(categoryMap.entries()).map(([category, submissions]) => ({
    category,
    submissions
  }));

  const data = {
    totalSubmissions: filteredOrders.length,
    approvedSubmissions: filteredOrders.filter(order => order.status === 'Approved').length,
    rejectedSubmissions: filteredOrders.filter(order => order.status === 'Rejected').length,
    ordersInQA: filteredOrders.filter(order => order.status === 'Under QA').length,
    ordersInWork: filteredOrders.filter(order => order.status === 'In Progress').length,
    categories
  };

  res.json(data);
};
