import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, User } from "@shared/types";

// Mock database - In production, use a real database
const users: User[] = [
  {
    id: '1',
    email: 'admin@mtwebexperts.com',
    name: 'Admin User',
    role: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'worker@mtwebexperts.com',
    name: 'John Worker',
    role: 'Worker',
    createdAt: new Date().toISOString(),
  }
];

// Mock password storage - In production, use proper password hashing
const passwords: Record<string, string> = {
  'admin@mtwebexperts.com': 'admin123',
  'worker@mtwebexperts.com': 'worker123',
};

export const handleLogin: RequestHandler = (req, res) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user || passwords[email] !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate a simple token (in production, use proper JWT)
  const token = `token_${user.id}_${Date.now()}`;

  // Log login activity
  const logEntry = {
    id: Date.now().toString(),
    userId: user.id,
    userName: user.name,
    action: 'User logged in',
    details: `${user.name} (${user.role}) logged into the system`,
    timestamp: new Date().toISOString(),
    type: 'login' as const,
  };

  // Store log (in production, save to database)
  console.log('Activity Log:', logEntry);

  const response: LoginResponse = {
    user,
    token,
  };

  res.json(response);
};

export const handleLogout: RequestHandler = (req, res) => {
  // In production, invalidate the token
  res.json({ message: 'Logged out successfully' });
};
