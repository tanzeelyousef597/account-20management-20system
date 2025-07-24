import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout } from "./routes/auth";
import { handleDashboardStats, handleDashboardData, handleWorkerDashboardData } from "./routes/dashboard";
import {
  handleGetWorkOrders,
  handleCreateWorkOrder,
  handleUpdateWorkOrder,
  handleUpdateWorkOrderStatus,
  handleDeleteWorkOrder,
  handleGetWorkerOrders,
  handleWorkerSubmitOrder
} from "./routes/work-orders";
import {
  handleGetUsers,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleUploadProfilePhoto,
  handleUploadWorkOrderFile
} from "./routes/users";
import {
  handleGetBonuses,
  handleGetWorkerBonuses,
  handleCreateBonus
} from "./routes/bonuses";
import {
  handleGetFines,
  handleGetWorkerFines,
  handleCreateFine
} from "./routes/fines";
import { handleGetActivityLogs } from "./routes/activity-logs";
import {
  handleGetInvoices,
  handleGetWorkerInvoices,
  handleCreateInvoice,
  handleGetUserStats
} from "./routes/invoices";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);

  // Dashboard routes
  app.get("/api/dashboard/stats", handleDashboardStats);
  app.get("/api/dashboard/data", handleDashboardData);

  // Work orders routes
  app.get("/api/work-orders", handleGetWorkOrders);
  app.post("/api/work-orders", handleCreateWorkOrder);
  app.put("/api/work-orders/:id", handleUpdateWorkOrder);
  app.put("/api/work-orders/:id/status", handleUpdateWorkOrderStatus);
  app.delete("/api/work-orders/:id", handleDeleteWorkOrder);
  app.get("/api/work-orders/worker/:workerId", handleGetWorkerOrders);
  app.post("/api/work-orders/worker-submit", handleWorkerSubmitOrder);

  // Users routes
  app.get("/api/users", handleGetUsers);
  app.post("/api/users", handleCreateUser);
  app.put("/api/users/:id", handleUpdateUser);
  app.delete("/api/users/:id", handleDeleteUser);
  app.post("/api/upload/profile-photo", handleUploadProfilePhoto);
  app.get("/api/users/:id/stats", handleGetUserStats);

  // Bonuses routes
  app.get("/api/bonuses", handleGetBonuses);
  app.get("/api/bonuses/worker/:workerId", handleGetWorkerBonuses);
  app.post("/api/bonuses", handleCreateBonus);

  // Fines routes
  app.get("/api/fines", handleGetFines);
  app.get("/api/fines/worker/:workerId", handleGetWorkerFines);
  app.post("/api/fines", handleCreateFine);

  // Activity logs routes
  app.get("/api/activity-logs", handleGetActivityLogs);

  // Invoices routes
  app.get("/api/invoices", handleGetInvoices);
  app.get("/api/invoices/worker/:workerId", handleGetWorkerInvoices);
  app.post("/api/invoices", handleCreateInvoice);

  return app;
}
