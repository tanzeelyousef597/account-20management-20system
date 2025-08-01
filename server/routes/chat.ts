import { RequestHandler } from "express";
import { ChatMessage, ChatConversation, SendMessageRequest, User, CreateGroupChatRequest } from "@shared/types";
import { users } from "./users";

// Mock database - In production, use a real database
let messages: ChatMessage[] = [];
let conversations: ChatConversation[] = [];
let nextMessageId = 1;
let nextConversationId = 1;

// Get or create conversation between two users
const getOrCreateConversation = (userId1: string, userId2: string): ChatConversation => {
  // Find existing conversation
  let conversation = conversations.find(conv => 
    conv.participantIds.includes(userId1) && conv.participantIds.includes(userId2)
  );

  if (!conversation) {
    // Create new conversation
    const participant1 = users.find(u => u.id === userId1);
    const participant2 = users.find(u => u.id === userId2);
    
    if (!participant1 || !participant2) {
      throw new Error('One or both users not found');
    }

    conversation = {
      id: nextConversationId.toString(),
      participantIds: [userId1, userId2],
      participants: [participant1, participant2],
      unreadCount: 0,
      lastActivity: new Date().toISOString(),
    };
    
    conversations.push(conversation);
    nextConversationId++;
  }

  return conversation;
};

// Search users by email
export const handleSearchUsers: RequestHandler = (req, res) => {
  const { email, currentUserId } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  // Find user by email (case insensitive)
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.id !== currentUserId
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found in teams' });
  }

  // Return user without sensitive information
  const { ...userInfo } = user;
  res.json(userInfo);
};

// Get conversations for a user
export const handleGetConversations: RequestHandler = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Find conversations for this user
  const userConversations = conversations
    .filter(conv => conv.participantIds.includes(userId))
    .map(conv => {
      // Get unread message count for this user
      const unreadCount = messages.filter(msg => 
        msg.receiverId === userId && 
        (conv.participantIds.includes(msg.senderId)) &&
        !msg.isRead
      ).length;

      // Get last message in this conversation
      const conversationMessages = messages
        .filter(msg => 
          conv.participantIds.includes(msg.senderId) && 
          conv.participantIds.includes(msg.receiverId)
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        ...conv,
        lastMessage: conversationMessages[0],
        unreadCount,
        lastActivity: conversationMessages[0]?.timestamp || conv.lastActivity,
      };
    })
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  res.json(userConversations);
};

// Get messages between two users
export const handleGetMessages: RequestHandler = (req, res) => {
  const { userId, otherUserId } = req.params;
  const { page = '1', limit = '50' } = req.query;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'Both user IDs are required' });
  }

  // Get messages between these users
  const conversationMessages = messages
    .filter(msg => 
      (msg.senderId === userId && msg.receiverId === otherUserId) ||
      (msg.senderId === otherUserId && msg.receiverId === userId)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Apply pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedMessages = conversationMessages.slice(startIndex, endIndex);

  res.json({
    messages: paginatedMessages,
    total: conversationMessages.length,
    page: pageNum,
    limit: limitNum,
    hasMore: endIndex < conversationMessages.length,
  });
};

// Send a message
export const handleSendMessage: RequestHandler = (req, res) => {
  const { senderId } = req.params;
  const { receiverId, content, messageType, fileUrl, fileName, fileSize } = req.body as SendMessageRequest;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Sender ID, receiver ID, and content are required' });
  }

  // Check if both users exist
  const sender = users.find(u => u.id === senderId);
  const receiver = users.find(u => u.id === receiverId);

  if (!sender || !receiver) {
    return res.status(404).json({ error: 'Sender or receiver not found' });
  }

  // Create new message
  const newMessage: ChatMessage = {
    id: nextMessageId.toString(),
    senderId,
    senderName: sender.name,
    receiverId,
    receiverName: receiver.name,
    content,
    messageType: messageType || 'text',
    fileUrl,
    fileName,
    fileSize,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  messages.push(newMessage);
  nextMessageId++;

  // Update or create conversation
  try {
    const conversation = getOrCreateConversation(senderId, receiverId);
    conversation.lastActivity = newMessage.timestamp;
  } catch (error) {
    console.error('Error updating conversation:', error);
  }

  res.json(newMessage);
};

// Mark messages as read
export const handleMarkAsRead: RequestHandler = (req, res) => {
  const { userId, otherUserId } = req.params;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'Both user IDs are required' });
  }

  // Mark all messages from otherUserId to userId as read
  const updatedCount = messages
    .filter(msg => msg.senderId === otherUserId && msg.receiverId === userId && !msg.isRead)
    .length;

  messages.forEach(msg => {
    if (msg.senderId === otherUserId && msg.receiverId === userId) {
      msg.isRead = true;
    }
  });

  res.json({ updatedCount });
};

// Upload chat file (images/documents)
export const handleUploadChatFile: RequestHandler = (req, res) => {
  const { fileType } = req.body;
  
  // Mock file upload - In production, use proper file upload service
  const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
  
  if (fileType === 'image') {
    // Mock image upload
    const mockUrl = `https://picsum.photos/seed/chat_${uniqueId}/800/600`;
    res.json({ 
      url: mockUrl,
      fileName: `image_${uniqueId}.jpg`,
      fileSize: Math.floor(Math.random() * 2000000) + 100000, // Random size between 100KB-2MB
    });
  } else {
    // Mock document upload
    const fileName = `document_${uniqueId}.pdf`;
    const fileId = uniqueId;
    const localUrl = `/api/download/${fileId}?filename=${encodeURIComponent(fileName)}`;
    res.json({ 
      url: localUrl,
      fileName: fileName,
      fileSize: Math.floor(Math.random() * 10000000) + 500000, // Random size between 500KB-10MB
    });
  }
};

// Get online status (mock implementation)
export const handleGetOnlineStatus: RequestHandler = (req, res) => {
  const { userIds } = req.body;
  
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: 'userIds must be an array' });
  }

  // Mock online status - in production, track real user sessions
  const onlineStatus = userIds.reduce((acc: Record<string, boolean>, userId: string) => {
    acc[userId] = Math.random() > 0.3; // 70% chance of being online
    return acc;
  }, {});

  res.json(onlineStatus);
};
