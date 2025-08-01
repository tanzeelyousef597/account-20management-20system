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
  handleUploadWorkOrderFile,
  handleDownloadFile
} from "./routes/users";
import {
  handleGetBonuses,
  handleGetWorkerBonuses,
  handleCreateBonus,
  handleUpdateBonus,
  handleDeleteBonus
} from "./routes/bonuses";
import {
  handleGetFines,
  handleGetWorkerFines,
  handleCreateFine,
  handleUpdateFine,
  handleDeleteFine
} from "./routes/fines";
import { handleGetActivityLogs } from "./routes/activity-logs";
import {
  handleGetInvoices,
  handleGetWorkerInvoices,
  handleCreateInvoice,
  handleGetUserStats
} from "./routes/invoices";
import {
  handleGetWhatsAppSettings,
  handleUpdateWhatsAppSettings
} from "./routes/settings";
import {
  handleSearchUsers,
  handleGetConversations,
  handleGetMessages,
  handleSendMessage,
  handleMarkAsRead,
  handleUploadChatFile,
  handleGetOnlineStatus,
  handleCreateGroupChat
} from "./routes/chat";

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
  app.get("/api/dashboard/worker/:workerId", handleWorkerDashboardData);

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
  app.post("/api/upload/work-order-file", handleUploadWorkOrderFile);
  app.get("/api/download/:fileId", handleDownloadFile);
  app.get("/api/users/:id/stats", handleGetUserStats);

  // Bonuses routes
  app.get("/api/bonuses", handleGetBonuses);
  app.get("/api/bonuses/worker/:workerId", handleGetWorkerBonuses);
  app.post("/api/bonuses", handleCreateBonus);
  app.put("/api/bonuses/:id", handleUpdateBonus);
  app.delete("/api/bonuses/:id", handleDeleteBonus);

  // Fines routes
  app.get("/api/fines", handleGetFines);
  app.get("/api/fines/worker/:workerId", handleGetWorkerFines);
  app.post("/api/fines", handleCreateFine);
  app.put("/api/fines/:id", handleUpdateFine);
  app.delete("/api/fines/:id", handleDeleteFine);

  // Activity logs routes
  app.get("/api/activity-logs", handleGetActivityLogs);

  // Invoices routes
  app.get("/api/invoices", handleGetInvoices);
  app.get("/api/invoices/worker/:workerId", handleGetWorkerInvoices);
  app.post("/api/invoices", handleCreateInvoice);

  // Settings routes
  app.get("/api/settings/whatsapp", handleGetWhatsAppSettings);
  app.post("/api/settings/whatsapp", handleUpdateWhatsAppSettings);

  // Chat routes
  app.get("/api/chat/search-users", handleSearchUsers);
  app.get("/api/chat/conversations/:userId", handleGetConversations);
  app.get("/api/chat/messages/:userId/:otherUserId", handleGetMessages);
  app.post("/api/chat/send/:senderId", handleSendMessage);
  app.put("/api/chat/mark-read/:userId/:otherUserId", handleMarkAsRead);
  app.post("/api/chat/upload-file", handleUploadChatFile);
  app.post("/api/chat/online-status", handleGetOnlineStatus);

  return app;
}
