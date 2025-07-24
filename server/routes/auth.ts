import { RequestHandler } from "express";
import { LoginRequest, LoginResponse } from "@shared/types";
import { users, userPasswords } from "./users";

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
