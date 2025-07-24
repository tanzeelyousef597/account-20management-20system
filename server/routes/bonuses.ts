import { RequestHandler } from "express";
import { Bonus } from "@shared/types";

// Mock database - In production, use a real database
let bonuses: Bonus[] = [];
let nextId = 1;

export const handleGetBonuses: RequestHandler = (req, res) => {
  res.json(bonuses);
};

export const handleGetWorkerBonuses: RequestHandler = (req, res) => {
  const { workerId } = req.params;
  const workerBonuses = bonuses.filter(bonus => bonus.workerId === workerId);
  res.json(workerBonuses);
};

export const handleCreateBonus: RequestHandler = (req, res) => {
  const { workerId, workerName, amount, reason, month, year } = req.body;
  
  const newBonus: Bonus = {
    id: nextId.toString(),
    workerId,
    workerName,
    amount,
    reason,
    month,
    year,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
  };
  
  bonuses.push(newBonus);
  nextId++;
  
  res.json(newBonus);
};
