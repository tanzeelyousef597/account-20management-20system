import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkOrders from "./pages/WorkOrders";
import AssignedOrders from "./pages/AssignedOrders";
import OrdersFromWorkers from "./pages/OrdersFromWorkers";
import UserManagement from "./pages/UserManagement";
import Invoices from "./pages/Invoices";
import Bonuses from "./pages/Bonuses";
import Fines from "./pages/Fines";
import ActivityLogs from "./pages/ActivityLogs";
import MyOrders from "./pages/MyOrders";
import MyInvoices from "./pages/MyInvoices";
import MyBonuses from "./pages/MyBonuses";
import MyFines from "./pages/MyFines";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/assigned-orders" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <AssignedOrders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/orders-from-workers" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <OrdersFromWorkers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/work-orders" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <WorkOrders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/bonuses" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <Bonuses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/fines" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <Fines />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <ActivityLogs />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute requiredRole="Worker">
                <Layout>
                  <MyOrders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-invoices" element={
              <ProtectedRoute requiredRole="Worker">
                <Layout>
                  <MyInvoices />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-bonuses" element={
              <ProtectedRoute requiredRole="Worker">
                <Layout>
                  <MyBonuses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-fines" element={
              <ProtectedRoute requiredRole="Worker">
                <Layout>
                  <MyFines />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
