import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout } from "./routes/auth";
import { handleDashboardStats, handleDashboardData } from "./routes/dashboard";
import {
  handleGetWorkOrders,
  handleCreateWorkOrder,
  handleUpdateWorkOrder,
  handleUpdateWorkOrderStatus,
  handleDeleteWorkOrder
} from "./routes/work-orders";
import {
  handleGetUsers,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleUploadProfilePhoto
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

  // Users routes
  app.get("/api/users", handleGetUsers);
  app.post("/api/users", handleCreateUser);
  app.put("/api/users/:id", handleUpdateUser);
  app.delete("/api/users/:id", handleDeleteUser);
  app.post("/api/upload/profile-photo", handleUploadProfilePhoto);

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

  // Mock routes for development
  app.get("/api/invoices", (req, res) => res.json([]));
  app.post("/api/invoices", (req, res) => res.json({ id: Date.now().toString(), ...req.body }));
  app.get("/api/users/:id/stats", (req, res) => res.json({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    fines: 0,
    bonuses: 0
  }));

  return app;
}
