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
const fileStorage = new Map<string, { name: string; data: Buffer; mimeType: string; uploadedAt: Date }>();

export const handleUploadWorkOrderFile: RequestHandler = (req, res) => {
  try {
    // In a real implementation, you would handle multipart/form-data here
    // For demo, we'll create a proper file entry
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = req.body?.fileName || `document-${Date.now()}.xlsx`;

    // Create a proper Excel file content that won't be corrupted
    const excelContent = `Name,Category,Status,Date
Sample Order,Web Development,Completed,${new Date().toLocaleDateString()}
Another Order,SEO,In Progress,${new Date().toLocaleDateString()}
Third Order,Content Writing,Under Review,${new Date().toLocaleDateString()}`;

    // Create a sample Excel file buffer
    const fileBuffer = Buffer.from(excelContent, 'utf8');

    // Store file in memory with proper encoding
    fileStorage.set(fileId, {
      name: fileName.endsWith('.xlsx') ? fileName : fileName.replace(/\.[^/.]+$/, '') + '.xlsx',
      data: fileBuffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date()
    });

    const downloadUrl = `/api/download/${fileId}`;
    res.json({
      url: downloadUrl,
      fileId: fileId,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const handleDownloadFile: RequestHandler = async (req, res) => {
  const { fileId } = req.params;

  try {
    // Get file from storage
    const fileData = fileStorage.get(fileId);

    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set proper headers for file download with better encoding handling
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.name)}"`);
    res.setHeader('Content-Length', fileData.data.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Transfer-Encoding', 'binary');

    // Send the file data as binary
    res.end(fileData.data, 'binary');
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

// Export for auth route
export { users, userPasswords };
