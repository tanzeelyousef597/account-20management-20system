import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout } from "./routes/auth";
import { handleDashboardStats } from "./routes/dashboard";

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

  return app;
}
