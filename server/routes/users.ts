import { RequestHandler } from "express";
import { User, CreateUserRequest } from "@shared/types";

// Mock database - In production, use a real database
let users: User[] = [
  {
    id: '1',
    email: 'admin@mtwebexperts.com',
    name: 'Admin User',
    role: 'Admin',
    whatsappNumber: '+923189046142',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'worker@mtwebexperts.com',
    name: 'John Worker',
    role: 'Worker',
    whatsappNumber: '+923280909654',
    createdAt: new Date().toISOString(),
  }
];

// Mock password storage - In production, use proper password hashing
let userPasswords: Record<string, string> = {
  'admin@mtwebexperts.com': 'admin123',
  'worker@mtwebexperts.com': 'worker123',
};

let nextUserId = 3;

export const handleGetUsers: RequestHandler = (req, res) => {
  res.json(users);
};

export const handleCreateUser: RequestHandler = (req, res) => {
  const { name, email, password, role, profilePhoto, whatsappNumber } = req.body as CreateUserRequest;

  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser: User = {
    id: nextUserId.toString(),
    email,
    name,
    role,
    profilePhoto,
    whatsappNumber,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  // Store password for authentication
  userPasswords[email] = password;
  nextUserId++;

  res.json(newUser);
};

export const handleUpdateUser: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, profilePhoto, whatsappNumber } = req.body;

  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const oldEmail = users[userIndex].email;

  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    role,
    profilePhoto: profilePhoto || users[userIndex].profilePhoto,
    whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : users[userIndex].whatsappNumber,
  };

  // Update password if provided
  if (password) {
    userPasswords[email] = password;
    // Remove old email key if email changed
    if (email !== oldEmail) {
      delete userPasswords[oldEmail];
    }
  } else if (email !== oldEmail) {
    // If email changed but password not provided, move the password to new email
    userPasswords[email] = userPasswords[oldEmail];
    delete userPasswords[oldEmail];
  }

  res.json(users[userIndex]);
};

export const handleDeleteUser: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
};

export const handleUploadProfilePhoto: RequestHandler = (req, res) => {
  // Mock file upload - In production, use proper file upload service
  // Generate a unique URL for each upload to ensure different images
  const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
  const mockUrl = `https://picsum.photos/seed/${uniqueId}/400/400`;
  res.json({ url: mockUrl });
};

export const handleUploadWorkOrderFile: RequestHandler = (req, res) => {
  // Mock file upload for work orders - In production, use proper file upload service
  // Return a local downloadable URL that bypasses CORS
  const fileName = `sample-document-${Date.now()}.pdf`;
  const fileId = Date.now().toString();
  const localUrl = `/api/download/${fileId}?filename=${encodeURIComponent(fileName)}`;
  res.json({ url: localUrl });
};

export const handleDownloadFile: RequestHandler = async (req, res) => {
  const { fileId } = req.params;
  const { filename } = req.query;

  try {
    // For demo purposes, we'll fetch the dummy PDF and serve it with proper headers
    const response = await fetch('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

    if (!response.ok) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = await response.arrayBuffer();
    const finalFilename = filename || `document-${fileId}.pdf`;

    // Set proper headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

// Export for auth route
export { users, userPasswords };
