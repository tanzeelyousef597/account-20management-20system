import { RequestHandler } from "express";
import { Fine } from "@shared/types";
import { addActivityLog } from "./activity-logs";

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

export const handleUpdateFine: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { workerId, workerName, amount, reason } = req.body;

  const fineIndex = fines.findIndex(fine => fine.id === id);

  if (fineIndex === -1) {
    return res.status(404).json({ error: 'Fine not found' });
  }

  fines[fineIndex] = {
    ...fines[fineIndex],
    workerId,
    workerName,
    amount,
    reason,
  };

  res.json(fines[fineIndex]);
};

export const handleDeleteFine: RequestHandler = (req, res) => {
  const { id } = req.params;

  const fineIndex = fines.findIndex(fine => fine.id === id);

  if (fineIndex === -1) {
    return res.status(404).json({ error: 'Fine not found' });
  }

  fines.splice(fineIndex, 1);
  res.json({ message: 'Fine deleted successfully' });
};
