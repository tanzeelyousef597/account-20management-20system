import { RequestHandler } from "express";
import { User, CreateUserRequest } from "@shared/types";
import { addActivityLog } from "./activity-logs";
import multer from 'multer';
import { Request } from 'express';

// Configure multer for file uploads with increased size limits
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    fieldSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('file');

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

export const handleUploadWorkOrderFile: RequestHandler = (req: Request & { file?: Express.Multer.File }, res) => {
  try {
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file');

    // Check if file was uploaded
    if (!req.file && !req.body.fileName) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let fileName: string;
    let fileBuffer: Buffer;
    let mimeType: string;
    let originalName: string;

    if (req.file) {
      // Real file upload - preserve original file data
      fileName = req.file.originalname;
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      originalName = req.file.originalname;

      console.log(`Processing real file: ${fileName}, Size: ${fileBuffer.length} bytes, Type: ${mimeType}`);
    } else {
      // Fallback for filename-only uploads (for compatibility)
      originalName = req.body.fileName || `work-order-${Date.now()}.txt`;
      fileName = originalName;

      // Create minimal placeholder content
      const fileContent = `MT Web Experts - Work Order File\n\nOriginal filename: ${originalName}\nUploaded: ${new Date().toLocaleString()}\n\nThis file was uploaded to the work order system.`;
      fileBuffer = Buffer.from(fileContent, 'utf8');
      mimeType = 'text/plain';

      console.log(`Processing filename-only upload: ${fileName}`);
    }

    // Validate file size
    if (fileBuffer.length > 100 * 1024 * 1024) { // 100MB
      return res.status(413).json({ error: 'File too large. Maximum size is 100MB.' });
    }

    // Store file in memory with complete metadata
    fileStorage.set(fileId, {
      name: fileName,
      data: fileBuffer,
      mimeType: mimeType,
      originalName: originalName,
      uploadedAt: new Date(),
      size: fileBuffer.length
    });

    console.log(`File stored successfully: ${fileId}, Name: ${fileName}, Size: ${fileBuffer.length} bytes`);

    const downloadUrl = `/api/download/${fileId}`;
    res.json({
      url: downloadUrl,
      fileId: fileId,
      fileName: fileName,
      originalName: originalName,
      size: fileBuffer.length,
      success: true
    });
  } catch (error) {
    console.error('Upload error:', error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return res.status(413).json({ error: 'File too large. Please select a smaller file.' });
      }
      if (error.message.includes('Unexpected field')) {
        return res.status(400).json({ error: 'Invalid file upload format.' });
      }
    }

    res.status(500).json({
      error: 'Error creating file, please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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

    // Sanitize filename for download
    const safeFilename = fileData.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Set comprehensive headers for proper file download
    res.setHeader('Content-Type', fileData.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(fileData.name)}`);
    res.setHeader('Content-Length', fileData.data.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Send file data as buffer to preserve binary data integrity
    res.send(fileData.data);

    console.log(`File download completed: ${fileData.name}`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

// Export for auth route
export { users, userPasswords };
