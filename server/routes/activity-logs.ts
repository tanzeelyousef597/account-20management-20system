import { RequestHandler } from "express";
import { ActivityLog } from "@shared/types";

// Mock database - In production, use a real database
let activityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin User',
    action: 'User logged in',
    details: 'Admin User (Admin) logged into the system',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    type: 'login'
  },
  {
    id: '2',
    userId: '2',
    userName: 'John Worker',
    action: 'User logged in',
    details: 'John Worker (Worker) logged into the system',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    type: 'login'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Admin User',
    action: 'Work order created',
    details: 'Created new work order: Content Writing Project',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: 'order_created'
  },
  {
    id: '4',
    userId: '1',
    userName: 'Admin User',
    action: 'User account created',
    details: 'Created new worker account for Jane Smith',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: 'user_created'
  }
];
let nextId = 5;

export const handleGetActivityLogs: RequestHandler = (req, res) => {
  // Sort by timestamp, newest first
  const sortedLogs = activityLogs.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  res.json(sortedLogs);
};

export const addActivityLog = (log: Omit<ActivityLog, 'id'>) => {
  const newLog: ActivityLog = {
    ...log,
    id: nextId.toString(),
  };
  
  activityLogs.push(newLog);
  nextId++;
  
  return newLog;
};
