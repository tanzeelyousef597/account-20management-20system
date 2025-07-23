import { RequestHandler } from "express";
import { DashboardStats } from "@shared/types";

export const handleDashboardStats: RequestHandler = (req, res) => {
  // Mock statistics - In production, query from database
  const stats: DashboardStats = {
    totalSubmissions: 139,
    approvedSubmissions: 127,
    ordersInQA: 8,
    totalOrders: 24,
    thisMonthSubmissions: 45,
    pendingInvoices: 3,
  };

  res.json(stats);
};
