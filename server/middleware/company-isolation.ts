import { RequestHandler } from "express";
import { users } from "../routes/users";

// Middleware to ensure data isolation between companies
export const companyIsolationMiddleware: RequestHandler = (req, res, next) => {
  // Skip isolation for Super Admin
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // In a real implementation, you'd parse the JWT token
    // For now, we'll check based on user ID in query params
    const userId = req.query.userId as string;
    const user = users.find(u => u.id === userId);
    
    if (user?.role === 'SuperAdmin') {
      return next();
    }
    
    // For regular users, add company filtering to the request
    if (user?.companyId) {
      req.companyId = user.companyId;
    }
  }
  
  next();
};

// Extend Express Request interface to include companyId
declare global {
  namespace Express {
    interface Request {
      companyId?: string;
    }
  }
}

// Helper function to filter data by company
export const filterByCompany = <T extends { companyId?: string }>(
  data: T[], 
  companyId?: string
): T[] => {
  if (!companyId) return data;
  return data.filter(item => item.companyId === companyId);
};

// Helper function to add company ID to new data
export const addCompanyId = <T>(data: T, companyId?: string): T & { companyId?: string } => {
  if (!companyId) return data;
  return { ...data, companyId };
};
