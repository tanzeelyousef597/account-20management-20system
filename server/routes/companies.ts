import { RequestHandler } from "express";
import { Company } from "@shared/types";
import { v4 as uuidv4 } from 'uuid';
import { addActivityLog } from "./activity-logs";

// In-memory storage for companies (in production, use proper database)
export const companies: Company[] = [];

export const handleGetCompanies: RequestHandler = (req, res) => {
  res.json(companies);
};

export const handleCreateCompany: RequestHandler = (req, res) => {
  const { name, address, phoneNumber, plan, maxUsers } = req.body;
  const { userId, userName } = req.query;

  if (!name || !address || !phoneNumber || !plan || !maxUsers) {
    return res.status(400).json({ error: 'All company fields are required' });
  }

  // Check if company name already exists
  const existingCompany = companies.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existingCompany) {
    return res.status(400).json({ error: 'Company name already exists' });
  }

  const newCompany: Company = {
    id: uuidv4(),
    name,
    address,
    phoneNumber,
    plan,
    maxUsers: parseInt(maxUsers),
    currentUsers: 0,
    createdAt: new Date().toISOString(),
    isActive: true,
    databaseUrl: `${name.toLowerCase().replace(/\s+/g, '_')}_db` // Unique database identifier
  };

  companies.push(newCompany);

  // Log activity
  if (userId && userName) {
    addActivityLog({
      userId: userId as string,
      userName: userName as string,
      action: 'Company created',
      details: `Created new company: ${name}`,
      timestamp: new Date().toISOString(),
      type: 'company_management' as const,
    });
  }

  res.status(201).json(newCompany);
};

export const handleUpdateCompany: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, address, phoneNumber, plan, maxUsers, isActive } = req.body;
  const { userId, userName } = req.query;

  const companyIndex = companies.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const company = companies[companyIndex];
  
  // Update company fields
  if (name) company.name = name;
  if (address) company.address = address;
  if (phoneNumber) company.phoneNumber = phoneNumber;
  if (plan) company.plan = plan;
  if (maxUsers) company.maxUsers = parseInt(maxUsers);
  if (typeof isActive === 'boolean') company.isActive = isActive;

  // Log activity
  if (userId && userName) {
    addActivityLog({
      userId: userId as string,
      userName: userName as string,
      action: 'Company updated',
      details: `Updated company: ${company.name}`,
      timestamp: new Date().toISOString(),
      type: 'company_management' as const,
    });
  }

  res.json(company);
};

export const handleDeleteCompany: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;

  const companyIndex = companies.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const company = companies[companyIndex];
  companies.splice(companyIndex, 1);

  // Log activity
  if (userId && userName) {
    addActivityLog({
      userId: userId as string,
      userName: userName as string,
      action: 'Company deleted',
      details: `Deleted company: ${company.name}`,
      timestamp: new Date().toISOString(),
      type: 'company_management' as const,
    });
  }

  res.json({ message: 'Company deleted successfully' });
};

export const handleGetCompanyStats: RequestHandler = (req, res) => {
  const stats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.isActive).length,
    totalUsers: companies.reduce((sum, c) => sum + c.currentUsers, 0),
    maxCapacity: companies.reduce((sum, c) => sum + c.maxUsers, 0),
  };

  res.json(stats);
};
