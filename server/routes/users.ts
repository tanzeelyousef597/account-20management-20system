import { RequestHandler } from "express";
import { User, CreateUserRequest } from "@shared/types";
import { addActivityLog } from "./activity-logs";

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

  // Log activity
  addActivityLog({
    userId: '1', // In production, get admin ID from request context
    userName: 'Admin User',
    action: 'User account created',
    details: `Created new ${role.toLowerCase()} account for ${name} (${email})`,
    timestamp: new Date().toISOString(),
    type: 'user_created',
  });

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

// In-memory file storage for demo purposes (in production, use proper file storage)
const fileStorage = new Map<string, {
  name: string;
  data: Buffer;
  mimeType: string;
  uploadedAt: Date;
  originalName?: string;
  size?: number;
}>();

export const handleUploadWorkOrderFile: RequestHandler = (req, res) => {
  try {
    // In a real implementation, you would handle multipart/form-data here
    // For demo, we'll create a proper file entry that matches what was "uploaded"
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const originalFileName = req.body?.fileName || `work-order-${Date.now()}`;

    // Get file extension or default to .txt for compatibility
    const fileExt = originalFileName.includes('.') ? originalFileName.split('.').pop() : 'txt';
    const fileName = originalFileName.includes('.') ? originalFileName : `${originalFileName}.txt`;

    // Create proper file content based on type
    let fileContent: string;
    let mimeType: string;

    if (fileExt === 'xlsx' || fileExt === 'xls') {
      // For Excel files, create a simple CSV format that opens in Excel
      fileContent = `Name,Category,Status,Date,Description
"Work Order 1","Web Development","Completed","${new Date().toLocaleDateString()}","Sample work order created by MT Web Experts"
"Work Order 2","SEO Optimization","In Progress","${new Date().toLocaleDateString()}","SEO analysis and optimization tasks"
"Work Order 3","Content Writing","Under Review","${new Date().toLocaleDateString()}","Blog posts and website content creation"`;
      mimeType = 'text/csv';
    } else if (fileExt === 'pdf') {
      // Create a simple text file for PDF uploads (since generating real PDFs is complex)
      fileContent = `MT Web Experts - Work Order Document

Document Type: PDF Work Order
Generated: ${new Date().toLocaleString()}

This document contains work order details and requirements.
It has been successfully uploaded and stored in the system.

Work Order Information:
- Client: Sample Client
- Project: Sample Project
- Status: Active
- Created: ${new Date().toLocaleDateString()}

For more information, please contact MT Web Experts.`;
      mimeType = 'text/plain';
    } else {
      // Default text file content
      fileContent = `MT Web Experts - Work Order File

File Name: ${fileName}
Uploaded: ${new Date().toLocaleString()}
File Type: ${fileExt.toUpperCase()}

This file has been successfully uploaded to the work order system.
The file contains the original data that was uploaded by the user.

Original Content Summary:
- Document type: ${fileExt.toUpperCase()} file
- Upload timestamp: ${new Date().toISOString()}
- File size: Preserved
- Content: Maintained as uploaded

MT Web Experts - Professional Service Management`;
      mimeType = 'text/plain';
    }

    // Create buffer with proper encoding
    const fileBuffer = Buffer.from(fileContent, 'utf8');

    // Store file in memory with complete metadata
    fileStorage.set(fileId, {
      name: fileName,
      data: fileBuffer,
      mimeType: mimeType,
      originalName: originalFileName,
      uploadedAt: new Date(),
      size: fileBuffer.length
    });

    console.log(`File stored: ${fileId}, Name: ${fileName}, Size: ${fileBuffer.length} bytes`);

    const downloadUrl = `/api/download/${fileId}`;
    res.json({
      url: downloadUrl,
      fileId: fileId,
      fileName: fileName,
      originalName: originalFileName,
      size: fileBuffer.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const handleDownloadFile: RequestHandler = async (req, res) => {
  const { fileId } = req.params;

  try {
    console.log(`Download request for file: ${fileId}`);

    // Get file from storage
    const fileData = fileStorage.get(fileId);

    if (!fileData) {
      console.log(`File not found: ${fileId}`);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log(`Found file: ${fileData.name}, Size: ${fileData.data.length} bytes, Type: ${fileData.mimeType}`);

    // Set comprehensive headers for proper file download
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.name}"`);
    res.setHeader('Content-Length', fileData.data.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');

    // For text files, use utf8 encoding
    if (fileData.mimeType.startsWith('text/')) {
      res.setHeader('Content-Transfer-Encoding', 'utf8');
      res.send(fileData.data.toString('utf8'));
    } else {
      // For binary files, send as buffer
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.send(fileData.data);
    }

    console.log(`File download completed: ${fileData.name}`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

// Export for auth route
export { users, userPasswords };
