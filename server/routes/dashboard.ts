import { RequestHandler } from "express";

// Import work orders data to calculate dynamic stats
let workOrders: any[] = [];

// Function to update work orders reference
export const updateWorkOrdersReference = (orders: any[]) => {
  workOrders = orders;
};

export const handleDashboardStats: RequestHandler = (req, res) => {
  // Calculate dynamic statistics from actual work orders
  const totalSubmissions = workOrders.reduce((sum, order) => sum + (order.payRate || 0), 0);
  const approvedSubmissions = workOrders
    .filter(order => order.status === 'Approved')
    .reduce((sum, order) => sum + (order.payRate || 0), 0);

  const thisMonthOrders = workOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });
  const thisMonthSubmissions = thisMonthOrders.reduce((sum, order) => sum + (order.payRate || 0), 0);

  const stats = {
    totalSubmissions,
    approvedSubmissions,
    ordersInQA: workOrders.filter(order => order.status === 'Under QA').length,
    totalOrders: workOrders.length,
    thisMonthSubmissions,
    pendingInvoices: 0, // Would be calculated from invoice data
  };

  res.json(stats);
};

export const handleDashboardData: RequestHandler = (req, res) => {
  const { filter } = req.query;

  // Filter orders by time period
  let filteredOrders = workOrders;
  if (filter) {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case 'Last Day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'Last Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'Last Year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // No filter, include all
    }

    filteredOrders = workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
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
    totalSubmissions: filteredOrders.reduce((sum, order) => sum + (order.payRate || 0), 0),
    approvedSubmissions: filteredOrders
      .filter(order => order.status === 'Approved')
      .reduce((sum, order) => sum + (order.payRate || 0), 0),
    rejectedSubmissions: filteredOrders
      .filter(order => order.status === 'Rejected')
      .reduce((sum, order) => sum + (order.payRate || 0), 0),
    ordersInQA: filteredOrders.filter(order => order.status === 'Under QA').length,
    ordersInWork: filteredOrders.filter(order =>
      (order.status === 'In Progress' || order.status === 'Under QA') &&
      order.assignedTo &&
      order.status !== 'Approved' &&
      order.status !== 'Rejected'
    ).length,
    categories
  };

  res.json(data);
};

export const handleWorkerDashboardData: RequestHandler = (req, res) => {
  const { workerId } = req.params;
  const { filter } = req.query;

  // Filter orders for this specific worker
  let workerOrders = workOrders.filter(order =>
    order.assignedTo === workerId || order.createdBy === workerId
  );

  if (filter) {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case 'Last Day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'Last Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'Last Year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // No filter, include all
    }

    workerOrders = workerOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });
  }

  // Calculate category statistics for worker
  const categoryMap = new Map();
  workerOrders.forEach(order => {
    const category = order.category || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) || 0) + (order.payRate || 0));
  });

  const categories = Array.from(categoryMap.entries()).map(([category, submissions]) => ({
    category,
    submissions
  }));

  const data = {
    totalSubmissions: workerOrders.reduce((sum, order) => sum + (order.payRate || 0), 0),
    approvedSubmissions: workerOrders
      .filter(order => order.status === 'Approved')
      .reduce((sum, order) => sum + (order.payRate || 0), 0),
    rejectedSubmissions: workerOrders
      .filter(order => order.status === 'Rejected')
      .reduce((sum, order) => sum + (order.payRate || 0), 0),
    ordersInQA: workerOrders.filter(order => order.status === 'Under QA').length,
    ordersInWork: workerOrders.filter(order =>
      order.assignedTo === workerId &&
      (order.status === 'In Progress' || order.status === 'Under QA')
    ).length,
    categories
  };

  res.json(data);
};
