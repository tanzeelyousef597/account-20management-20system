import { RequestHandler } from "express";

// Mock settings storage - In production, use a real database
let whatsappSettings = {
  adminWhatsAppNumber: '+923189046142',
  messageTemplate: 'An order has been assigned to you by [Admin Name]. The due date is [Due Date].',
  isEnabled: true
};

export const handleGetWhatsAppSettings: RequestHandler = (req, res) => {
  res.json(whatsappSettings);
};

export const handleUpdateWhatsAppSettings: RequestHandler = (req, res) => {
  const { adminWhatsAppNumber, messageTemplate, isEnabled } = req.body;

  // Validate required fields
  if (!adminWhatsAppNumber || !messageTemplate) {
    return res.status(400).json({ error: 'Admin WhatsApp number and message template are required' });
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(adminWhatsAppNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format. Use format: +country code + number' });
  }

  // Update settings
  whatsappSettings = {
    adminWhatsAppNumber,
    messageTemplate,
    isEnabled: Boolean(isEnabled)
  };

  res.json({ message: 'Settings updated successfully', settings: whatsappSettings });
};

// Export settings for use in other modules
export { whatsappSettings };
