import { RequestHandler } from "express";
import { Fine } from "@shared/types";

// Mock database - In production, use a real database
let fines: Fine[] = [];
let nextId = 1;

export const handleGetFines: RequestHandler = (req, res) => {
  res.json(fines);
};

export const handleGetWorkerFines: RequestHandler = (req, res) => {
  const { workerId } = req.params;
  const workerFines = fines.filter(fine => fine.workerId === workerId);
  res.json(workerFines);
};

export const handleCreateFine: RequestHandler = (req, res) => {
  const { workerId, workerName, amount, reason } = req.body;
  
  const newFine: Fine = {
    id: nextId.toString(),
    workerId,
    workerName,
    amount,
    reason,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
  };
  
  fines.push(newFine);
  nextId++;
  
  res.json(newFine);
};
