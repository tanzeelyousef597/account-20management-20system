import { RequestHandler } from "express";
import { Invoice } from "@shared/types";
import { addActivityLog } from "./activity-logs";

// Mock database - In production, use a real database
let invoices: Invoice[] = [];
let nextId = 1;

export const handleGetInvoices: RequestHandler = (req, res) => {
  res.json(invoices);
};

export const handleGetWorkerInvoices: RequestHandler = (req, res) => {
  const { workerId } = req.params;
  const workerInvoices = invoices.filter(invoice => invoice.workerId === workerId);
  res.json(workerInvoices);
};

export const handleCreateInvoice: RequestHandler = (req, res) => {
  const { 
    workerId, 
    workerName, 
    month, 
    fixedPay, 
    workPay, 
    fine, 
    bonus, 
    totalAmount, 
    submissionCount, 
    isManual 
  } = req.body;
  
  const [year, monthStr] = month.split('-');
  
  const newInvoice: Invoice = {
    id: nextId.toString(),
    workerId,
    workerName,
    month: monthStr,
    year: parseInt(year),
    submissionCount: submissionCount || 0,
    fixedPay: fixedPay || 0,
    workPay: workPay || 0,
    fine: fine || 0,
    bonus: bonus || 0,
    totalAmount: totalAmount || 0,
    generatedAt: new Date().toISOString(),
    isManual: isManual || true,
  };
  
  invoices.push(newInvoice);
  nextId++;
  
  res.json(newInvoice);
};

export const handleGetUserStats: RequestHandler = (req, res) => {
  const { userId } = req.params;
  
  // Mock stats - In production, calculate from actual data
  const stats = {
    totalSubmissions: 0,
    approvedSubmissions: 0,
    fines: 0,
    bonuses: 0
  };
  
  res.json(stats);
};
