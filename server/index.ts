import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout } from "./routes/auth";
import { handleDashboardStats } from "./routes/dashboard";
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

  return app;
}
