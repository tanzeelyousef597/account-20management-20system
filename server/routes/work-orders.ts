import { RequestHandler } from "express";
import { WorkOrder } from "@shared/types";
import { updateWorkOrdersReference } from "./dashboard";

// Mock database - In production, use a real database
let workOrders: WorkOrder[] = [];
let nextId = 1;

// Update dashboard reference whenever work orders change
const updateDashboard = () => {
  updateWorkOrdersReference(workOrders);
};

export const handleGetWorkOrders: RequestHandler = (req, res) => {
  res.json(workOrders);
};

export const handleCreateWorkOrder: RequestHandler = (req, res) => {
  const { folderName, businessName, workCategory, totalSubmissions, submissionDate, description, assignedTo } = req.body;

  const newOrder: WorkOrder = {
    id: nextId.toString(),
    title: folderName,
    category: workCategory,
    description,
    status: 'Under QA',
    assignedTo,
    assignedToName: 'User Name', // In production, fetch from user ID
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    dueDate: submissionDate,
    payRate: parseInt(totalSubmissions),
  };

  workOrders.push(newOrder);
  nextId++;
  updateDashboard();

  res.json(newOrder);
};

export const handleUpdateWorkOrder: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { folderName, businessName, workCategory, totalSubmissions, submissionDate, description } = req.body;
  
  const orderIndex = workOrders.findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Work order not found' });
  }
  
  workOrders[orderIndex] = {
    ...workOrders[orderIndex],
    title: folderName,
    category: workCategory,
    description,
    dueDate: submissionDate,
    payRate: parseInt(totalSubmissions),
  };
  
  res.json(workOrders[orderIndex]);
};

export const handleUpdateWorkOrderStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = workOrders.findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Work order not found' });
  }

  workOrders[orderIndex].status = status;
  updateDashboard();
  res.json(workOrders[orderIndex]);
};

export const handleDeleteWorkOrder: RequestHandler = (req, res) => {
  const { id } = req.params;

  const orderIndex = workOrders.findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Work order not found' });
  }

  workOrders.splice(orderIndex, 1);
  res.json({ message: 'Work order deleted successfully' });
};

export const handleGetWorkerOrders: RequestHandler = (req, res) => {
  const { workerId } = req.params;
  const workerOrders = workOrders.filter(order =>
    order.assignedTo === workerId || order.createdBy === workerId
  );
  res.json(workerOrders);
};

export const handleWorkerSubmitOrder: RequestHandler = (req, res) => {
  const { folderName, businessName, workCategory, totalSubmissions, submissionDate, description, submittedBy, submittedByName } = req.body;

  const newOrder: WorkOrder = {
    id: nextId.toString(),
    title: folderName,
    category: workCategory,
    description,
    status: 'Under QA',
    createdBy: submittedBy,
    createdAt: new Date().toISOString(),
    dueDate: submissionDate,
    payRate: parseInt(totalSubmissions),
  };

  workOrders.push(newOrder);
  nextId++;

  res.json(newOrder);
};
