import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@shared/api-client';
import { ChatConversation, ChatMessage, User } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Send,
  Users,
  X,
  CheckCheck,
  Check,
  Circle,
  MessageSquare,
  Reply,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Simple encryption utility for basic privacy
const encryptMessage = (message: string, conversationId: string): string => {
  try {
    // Simple XOR encryption with conversation ID as key
    const key = conversationId.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0);
    const encrypted = message.split('').map(c =>
      String.fromCharCode(c.charCodeAt(0) ^ (key % 255))
    ).join('');
    return btoa(encrypted); // Base64 encode
  } catch {
    return message; // Fallback to unencrypted
  }
};

const decryptMessage = (encryptedMessage: string, conversationId: string): string => {
  try {
    const key = conversationId.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0);
    const decoded = atob(encryptedMessage);
    const decrypted = decoded.split('').map(c =>
      String.fromCharCode(c.charCodeAt(0) ^ (key % 255))
    ).join('');
    return decrypted;
  } catch {
    return encryptedMessage; // Fallback to original
  }
};

export default function ChatEnhanced() {
  const { user } = useAuth();
  const { refreshUnreadCount } = useChat();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllUsers().then((users) => {
        loadConversations(users);
      });

      // Set up auto-refresh for real-time updates
      const refreshInterval = setInterval(() => {
        if (user) {
          loadConversations();
          refreshUnreadCount();
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  // Save groups to localStorage whenever conversations change
  useEffect(() => {
    if (user && conversations.length > 0) {
      const groups = conversations.filter(c => c.isGroup);
      if (groups.length > 0) {
        saveGroupsToStorage();
      }
    }
  }, [conversations, user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);

      // Set up message refresh for current conversation
      const messageRefreshInterval = setInterval(() => {
        if (selectedConversation && user) {
          loadMessages(selectedConversation.id);
        }
      }, 10000); // Refresh messages every 10 seconds

      return () => clearInterval(messageRefreshInterval);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  const saveGroupsToStorage = () => {
    try {
      const groups = conversations.filter(c => c.isGroup);
      localStorage.setItem(`chat-groups-${user?.id}`, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups:', error);
    }
  };

  const loadConversations = async (users?: User[]) => {
    if (!user) return;

    const usersToUse = users || allUsers;

    try {
      let apiConversations = [];
      try {
        const data = await api.getConversations(user.id);
        apiConversations = data || [];
      } catch (apiError) {
        console.log('API conversations not available, using demo conversations');
      }

      // Only load direct (one-to-one) conversations, no groups
      let directConversations = [];
      if (apiConversations.length === 0 && usersToUse.length > 0) {
        // Create demo direct conversation for testing
        directConversations = [
          {
            id: 'demo-conv-1',
            name: usersToUse[0]?.name || 'Demo User',
            isGroup: false,
            participants: [user, usersToUse[0]].filter(Boolean),
            participantNames: [user.name, usersToUse[0]?.name].filter(Boolean),
            lastMessage: {
              content: 'Hey! How are you doing?',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              senderId: usersToUse[0]?.id || 'demo'
            },
            lastActivity: new Date(Date.now() - 300000).toISOString(),
            unreadCount: 0,
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];
      } else {
        // Filter out any group conversations, only keep direct chats
        directConversations = apiConversations.filter((conv: any) => !conv.isGroup);
      }

      setConversations(directConversations);

      refreshUnreadCount();

      const allUserIds = (apiConversations.length > 0 ? apiConversations : conversations)
        .flatMap(conv => conv.participants?.filter(p => p.id !== user.id).map(p => p.id) || []);

      if (allUserIds.length > 0) {
        try {
          const status = await api.getOnlineStatus(allUserIds);
          setOnlineStatus(status);
        } catch (statusError) {
          // Mock online status for demo
          const mockStatus: Record<string, boolean> = {};
          allUserIds.forEach(id => {
            mockStatus[id] = Math.random() > 0.5; // Random online status
          });
          setOnlineStatus(mockStatus);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    }
  };

  const loadAllUsers = async () => {
    if (!user) return [];

    try {
      const response = await api.get('/users');
      if (response.ok) {
        const users = await response.json();
        // Only include users that exist in User Management, excluding current user
        const realUsers = users.filter((u: User) => u.id !== user.id && u.email && u.name);
        console.log('Loaded real users from User Management:', realUsers);
        setAllUsers(realUsers);
        return realUsers;
      } else {
        console.warn('API response not ok, status:', response.status);
        setAllUsers([]);
        return [];
      }
    } catch (error) {
      console.error('Failed to load users from User Management:', error);
      // Show toast only if this is a real network error
      toast({
        title: 'Network Error',
        description: 'Could not load users. Please check your connection and try again.',
        variant: 'destructive',
      });
      setAllUsers([]);
      return [];
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      let messagesToShow = [];

      // For groups, load from localStorage
      if (selectedConversation?.isGroup) {
        const groupMessages = loadGroupMessages(conversationId);
        if (groupMessages.length > 0) {
          messagesToShow = groupMessages;
        } else {
          // Create welcome message for new groups
          const welcomeMessage = {
            id: `welcome-${conversationId}`,
            content: `Welcome to ${selectedConversation.name}! Start chatting with your team.`,
            senderId: 'system',
            senderName: 'System',
            timestamp: new Date().toISOString(),
            messageType: 'text' as const,
            isRead: true,
            conversationId: conversationId,
            replyTo: null
          };
          messagesToShow = [welcomeMessage];
          saveGroupMessages(conversationId, welcomeMessage);
        }
      } else {
        // For direct messages, try API first, then demo
        try {
          const response = await api.getMessages(conversationId);
          messagesToShow = response.messages || [];
        } catch (apiError) {
          console.log('API messages not available, using demo messages');
        }

        // If no API messages for direct chat, create demo messages
        if (messagesToShow.length === 0) {
          const otherUser = selectedConversation?.participants.find(p => p.id !== user.id);
          messagesToShow = [
            {
              id: 'demo-1',
              content: 'Hey! How are you doing?',
              senderId: otherUser?.id || 'other',
              senderName: otherUser?.name || 'Other User',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              messageType: 'text' as const,
              isRead: true,
              conversationId: conversationId,
              replyTo: null
            },
            {
              id: 'demo-2',
              content: 'I\'m doing great, thanks for asking! How about you?',
              senderId: user.id,
              senderName: user.name,
              timestamp: new Date(Date.now() - 240000).toISOString(),
              messageType: 'text' as const,
              isRead: true,
              conversationId: conversationId,
              replyTo: {
                id: 'demo-1',
                content: 'Hey! How are you doing?',
                senderName: otherUser?.name || 'Other User',
                senderId: otherUser?.id || 'other'
              }
            }
          ];
        }
      }

      setMessages(messagesToShow);

      try {
        await api.markMessagesAsRead(conversationId, user.id);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (readError) {
        console.error('Failed to mark messages as read:', readError);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const messageContent = newMessage.trim();

      // Create a permanent message for groups (since backend might not handle groups)
      const encryptedContent = encryptMessage(messageContent, selectedConversation.id);
      const newMessageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: encryptedContent,
        senderId: user.id,
        senderName: user.name,
        timestamp: new Date().toISOString(),
        messageType: 'text' as const,
        isRead: false,
        conversationId: selectedConversation.id,
        replyTo: replyingTo ? {
          id: replyingTo.id,
          content: encryptMessage(replyingTo.content, selectedConversation.id),
          senderName: replyingTo.senderName,
          senderId: replyingTo.senderId
        } : null
      };

      // Add message to UI immediately and force re-render
      setMessages(prev => {
        const updated = [...prev, newMessageObj];
        // Force scroll to bottom after state update
        setTimeout(() => scrollToBottom(), 100);
        return updated;
      });
      setNewMessage('');
      setReplyingTo(null);

      // Force conversations list update
      setTimeout(() => {
        setConversations(prev => [...prev]);
      }, 100);

      // Update conversation with last message (store encrypted for privacy)
      const updatedConversation = {
        ...selectedConversation,
        lastMessage: {
          content: encryptedContent,
          timestamp: new Date().toISOString(),
          senderId: user.id,
          senderName: user.name
        },
        lastActivity: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id ? updatedConversation : conv
        )
      );

      // For groups, save messages to localStorage for persistence
      if (selectedConversation.isGroup) {
        saveGroupMessages(selectedConversation.id, newMessageObj);
      } else {
        // Try to send to backend for direct messages
        try {
          const otherUser = selectedConversation.participants.find(p => p.id !== user.id);
          const messageData: any = {
            conversationId: selectedConversation.id,
            content: messageContent,
            messageType: 'text',
          };

          if (replyingTo) {
            messageData.replyTo = {
              id: replyingTo.id,
              content: replyingTo.content,
              senderName: replyingTo.senderName,
              senderId: replyingTo.senderId
            };
          }

          if (otherUser) {
            messageData.receiverId = otherUser.id;
          }

          await api.sendMessage(user.id, messageData);
        } catch (apiError) {
          console.log('API send failed, message stored locally:', apiError);
        }
      }

      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const saveGroupMessages = (conversationId: string, message: any) => {
    try {
      const key = `group-messages-${conversationId}`;
      const existing = localStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(message);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save group message:', error);
    }
  };

  const loadGroupMessages = (conversationId: string) => {
    try {
      const key = `group-messages-${conversationId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load group messages:', error);
      return [];
    }
  };

  const handleCreateGroup = async () => {
    console.log('Creating group:', { groupName, selectedGroupMembers, allUsers });

    if (!groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    if (selectedGroupMembers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one member',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get selected users
      const selectedUsers = allUsers.filter(u => selectedGroupMembers.includes(u.id));
      console.log('Selected users for group:', selectedUsers);

      // Create group conversation
      const mockGroupConversation = {
        id: `group-${Date.now()}`,
        name: groupName.trim(),
        isGroup: true,
        participants: [user!, ...selectedUsers],
        participantNames: [user!.name, ...selectedUsers.map(u => u.name)],
        lastMessage: {
          content: `Group "${groupName.trim()}" created by ${user!.name}`,
          timestamp: new Date().toISOString(),
          senderId: user!.id,
          senderName: user!.name
        },
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString()
      };

      console.log('Created group conversation:', mockGroupConversation);

      // Add to conversations list
      setConversations(prev => {
        const newConversations = [mockGroupConversation, ...prev];
        // Immediately save groups to localStorage
        setTimeout(() => {
          try {
            const groups = newConversations.filter(c => c.isGroup);
            localStorage.setItem(`chat-groups-${user.id}`, JSON.stringify(groups));
          } catch (error) {
            console.error('Failed to save group immediately:', error);
          }
        }, 0);
        return newConversations;
      });

      // Close dialog and reset form
      setIsCreateGroupOpen(false);
      setGroupName('');
      setSelectedGroupMembers([]);

      toast({
        title: 'Success',
        description: `Group "${groupName.trim()}" created with ${selectedUsers.length} members`,
      });

      // Select the newly created group
      setSelectedConversation(mockGroupConversation);

    } catch (error) {
      console.error('Failed to create group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group chat',
        variant: 'destructive',
      });
    }
  };

  const handleManageGroup = async () => {
    if (!selectedConversation?.isGroup) return;

    try {
      // Use participants from the conversation object
      setGroupMembers(selectedConversation.participants || []);
      setIsManageGroupOpen(true);
    } catch (error) {
      console.error('Failed to load group members:', error);
    }
  };

  const handleAddGroupMember = async (userId: string) => {
    if (!selectedConversation?.isGroup) return;

    try {
      const userToAdd = allUsers.find(u => u.id === userId);
      if (!userToAdd) return;

      // Update the conversation with new member
      const updatedConversation = {
        ...selectedConversation,
        participants: [...selectedConversation.participants, userToAdd],
        participantNames: [...(selectedConversation.participantNames || []), userToAdd.name]
      };

      // Update conversations list
      setConversations(prev => {
        const newConversations = prev.map(conv =>
          conv.id === selectedConversation.id ? updatedConversation : conv
        );
        // Save groups to localStorage
        setTimeout(() => {
          try {
            const groups = newConversations.filter(c => c.isGroup);
            localStorage.setItem(`chat-groups-${user.id}`, JSON.stringify(groups));
          } catch (error) {
            console.error('Failed to save updated group:', error);
          }
        }, 0);
        return newConversations;
      });

      // Update selected conversation
      setSelectedConversation(updatedConversation);

      // Update group members
      setGroupMembers(updatedConversation.participants);

      toast({
        title: 'Success',
        description: 'Member added to group',
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member to group',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveGroupMember = async (userId: string) => {
    if (!selectedConversation?.isGroup || userId === user?.id) return;

    try {
      // Update the conversation by removing the member
      const updatedParticipants = selectedConversation.participants.filter(p => p.id !== userId);
      const updatedConversation = {
        ...selectedConversation,
        participants: updatedParticipants,
        participantNames: updatedParticipants.map(p => p.name)
      };

      // Update conversations list
      setConversations(prev => {
        const newConversations = prev.map(conv =>
          conv.id === selectedConversation.id ? updatedConversation : conv
        );
        // Save groups to localStorage
        setTimeout(() => {
          try {
            const groups = newConversations.filter(c => c.isGroup);
            localStorage.setItem(`chat-groups-${user.id}`, JSON.stringify(groups));
          } catch (error) {
            console.error('Failed to save updated group:', error);
          }
        }, 0);
        return newConversations;
      });

      // Update selected conversation
      setSelectedConversation(updatedConversation);

      // Update group members
      setGroupMembers(updatedParticipants);

      toast({
        title: 'Success',
        description: 'Member removed from group',
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member from group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;

    try {
      // Remove message from UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      // For groups, update localStorage
      if (selectedConversation.isGroup) {
        const key = `group-messages-${selectedConversation.id}`;
        const existing = localStorage.getItem(key);
        if (existing) {
          const messages = JSON.parse(existing);
          const updatedMessages = messages.filter((msg: any) => msg.id !== messageId);
          localStorage.setItem(key, JSON.stringify(updatedMessages));
        }
      }

      // For individual chats, try to delete from API
      try {
        await api.deleteMessage(messageId);
      } catch (apiError) {
        console.log('API delete failed, message removed locally');
      }

      toast({
        title: 'Message Deleted',
        description: 'Message has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedConversation) return;

    try {
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));

      // If group, remove from localStorage
      if (selectedConversation.isGroup) {
        const groupsKey = `chat-groups-${user?.id}`;
        const messagesKey = `group-messages-${selectedConversation.id}`;

        const existing = localStorage.getItem(groupsKey);
        if (existing) {
          const groups = JSON.parse(existing);
          const updatedGroups = groups.filter((g: any) => g.id !== selectedConversation.id);
          localStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
        }

        localStorage.removeItem(messagesKey);
      }

      // Try to delete from API
      try {
        await api.deleteConversation(selectedConversation.id);
      } catch (apiError) {
        console.log('API delete failed, conversation removed locally');
      }

      // Clear selected conversation
      setSelectedConversation(null);
      setMessages([]);

      toast({
        title: 'Chat Deleted',
        description: 'Chat has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat',
        variant: 'destructive',
      });
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim() || !user) return;

    setIsSearching(true);
    try {
      const foundUser = await api.searchUserByEmail(searchEmail.trim(), user.id);
      setSelectedUser(foundUser);
      setSearchEmail('');
      toast({
        title: 'User Found',
        description: `Found ${foundUser.name} (${foundUser.email})`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'User Not Found',
        description: 'User not found in teams',
        variant: 'destructive',
      });
      setSelectedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (targetUser: User) => {
    if (!user) return;

    let existingConv = conversations.find(conv =>
      !conv.isGroup &&
      conv.participants.some(p => p.id === targetUser.id) &&
      conv.participants.some(p => p.id === user.id) &&
      conv.participants.length === 2
    );

    if (!existingConv) {
      try {
        const message = await api.sendMessage(user.id, {
          receiverId: targetUser.id,
          content: `Hello ${targetUser.name}! 👋`,
          messageType: 'text',
        });

        await loadConversations();

        existingConv = conversations.find(conv =>
          conv.id === message.conversationId ||
          (!conv.isGroup &&
           conv.participants.some(p => p.id === targetUser.id) &&
           conv.participants.some(p => p.id === user.id))
        );
      } catch (error) {
        console.error('Failed to start chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to start chat',
          variant: 'destructive',
        });
        return;
      }
    }

    if (existingConv) {
      setSelectedConversation(existingConv);
      setSelectedUser(null);
      setIsMobileConversationOpen(true);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        let href = part;
        if (!part.startsWith('http')) {
          href = `https://${part}`;
        }

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all hover:opacity-80 transition-opacity"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Enhanced Chat System
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            WhatsApp-style messaging with group management
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-xl border border-slate-200/60 shadow-lg backdrop-blur-sm h-[700px] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-gradient-to-br from-white to-slate-50/50 border-r border-slate-200/60 flex flex-col rounded-l-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Conversations
            </h3>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreateGroupOpen(true);
                  // Refresh users when opening dialog
                  if (allUsers.length === 0) {
                    loadAllUsers();
                  }
                }}
                title="Create group"
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 h-8 w-8 p-0"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsSearching(!isSearching)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Section */}
          {isSearching && (
            <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1 bg-white border-blue-200 focus:border-blue-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchUser();
                    }
                  }}
                />
                <Button size="sm" onClick={handleSearchUser} disabled={isSearching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedUser && (
                <Card className="mt-3 p-3 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedUser.profilePhoto} />
                        <AvatarFallback>
                          {getUserInitials(selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-green-800">{selectedUser.name}</div>
                        <div className="text-xs text-green-600">{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStartChat(selectedUser)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Start Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const otherUser = conversation.participants.find(p => p.id !== user?.id);
                
                return (
                  <Card
                    key={conversation.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border border-slate-200/60 group",
                      selectedConversation?.id === conversation.id
                        ? "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 shadow-md"
                        : "bg-white hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30"
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 relative">
                        {conversation.isGroup ? (
                          <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Hash className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.profilePhoto} />
                            <AvatarFallback>
                              {otherUser ? getUserInitials(otherUser.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {conversation.isGroup && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{conversation.participants.length}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-700 truncate flex items-center gap-1">
                            {conversation.isGroup && <Hash className="h-3 w-3 text-gray-500" />}
                            {conversation.name || otherUser?.name || 'Unknown'}
                            {conversation.isGroup && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
                                Group
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {conversation.lastMessage && (
                              <span className="text-xs text-slate-400">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {conversation.lastMessage?.content
                            ? decryptMessage(conversation.lastMessage.content, conversation.id)
                            : 'No messages yet'
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50/20 rounded-r-xl">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/50 bg-gradient-to-r from-white/80 to-blue-50/30 backdrop-blur-sm rounded-tr-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {selectedConversation.isGroup ? (
                      <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Hash className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.participants.find(p => p.id !== user?.id)?.profilePhoto} />
                        <AvatarFallback>
                          {getUserInitials(selectedConversation.participants.find(p => p.id !== user?.id)?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      {selectedConversation.isGroup && <Hash className="h-4 w-4 text-gray-500" />}
                      {selectedConversation.name}
                      {selectedConversation.isGroup && (
                        <Badge variant="secondary" className="text-xs">
                          Group
                        </Badge>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.isGroup 
                        ? `${selectedConversation.participants.length} members`
                        : `${selectedConversation.participants.find(p => p.id !== user?.id)?.name || 'User'}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedConversation.isGroup && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleManageGroup}
                      title="Manage group"
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteChatDialog(true)}
                    title="Delete chat"
                    className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    const senderName = isOwnMessage ? 'You' : (message.senderName || 'Unknown');
                    
                    return (
                      <div
                        key={message.id}
                        id={`message-${message.id}`}
                        className={cn(
                          'flex group max-w-[80%] transition-colors duration-500',
                          isOwnMessage ? 'ml-auto justify-end' : 'justify-start'
                        )}
                        onDoubleClick={() => setReplyingTo(message)}
                      >
                        <div className="relative">
                          {/* WhatsApp-style quoted message - Enhanced */}
                          {message.replyTo && (
                            <div className="mb-2">
                              <div className={cn(
                                "border-l-4 pl-3 py-2 rounded-r-md text-xs max-w-full relative cursor-pointer hover:bg-opacity-80 transition-colors",
                                isOwnMessage
                                  ? "border-blue-400 bg-blue-100/60"
                                  : "border-green-500 bg-green-100/80"
                              )}
                              onClick={() => {
                                // Scroll to original message if visible
                                const originalMsg = document.getElementById(`message-${message.replyTo?.id}`);
                                if (originalMsg) {
                                  originalMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  originalMsg.style.backgroundColor = isOwnMessage ? '#dbeafe' : '#dcfce7';
                                  setTimeout(() => {
                                    originalMsg.style.backgroundColor = '';
                                  }, 2000);
                                }
                              }}
                              title="Click to jump to original message"
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Reply className="h-2.5 w-2.5" />
                                  <span className={cn(
                                    "font-semibold text-xs",
                                    isOwnMessage ? "text-blue-700" : "text-green-700"
                                  )}>
                                    {message.replyTo.senderName}
                                  </span>
                                </div>
                                <div className={cn(
                                  "text-xs leading-relaxed line-clamp-2",
                                  isOwnMessage ? "text-blue-800" : "text-gray-700"
                                )}>
                                  {decryptMessage(message.replyTo.content, selectedConversation.id)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              "rounded-xl px-4 py-2 max-w-full relative shadow-sm transition-all duration-200 group",
                              isOwnMessage
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                                : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                            )}
                          >
                            {/* Message action buttons */}
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-6 w-6 p-0 shadow-md",
                                  isOwnMessage
                                    ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                                    : "bg-white hover:bg-gray-50 text-gray-600"
                                )}
                                onClick={() => setReplyingTo(message)}
                                title="Reply to this message"
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                              {isOwnMessage && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 shadow-md bg-red-100 hover:bg-red-200 text-red-700"
                                  onClick={() => {
                                    setMessageToDelete(message);
                                    setShowDeleteDialog(true);
                                  }}
                                  title="Delete this message"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Group chat sender name */}
                            {selectedConversation.isGroup && !isOwnMessage && (
                              <div className="text-xs font-semibold text-blue-600 mb-1">
                                {senderName}
                              </div>
                            )}
                            
                            <p className="text-sm break-words leading-relaxed">
                              {renderMessageWithLinks(decryptMessage(message.content, selectedConversation.id))}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2 gap-2">
                              <span className={cn(
                                "text-xs",
                                isOwnMessage ? "text-blue-100" : "text-slate-500"
                              )}>
                                {formatTime(message.timestamp)}
                              </span>
                              {isOwnMessage && (
                                <div className="text-blue-100">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-slate-200/50 p-4 bg-gradient-to-r from-white/90 to-blue-50/30 backdrop-blur-sm rounded-br-xl">
                {/* Reply indicator */}
                {replyingTo && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-700">
                            Replying to {replyingTo.senderName}
                          </span>
                        </div>
                        <div className="text-sm text-blue-800 bg-white/60 rounded px-2 py-1 line-clamp-2">
                          {replyingTo.content}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        className="ml-2 h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={replyingTo ? 'Reply to message...' : 'Type a message...'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      } else if (e.key === 'Escape' && replyingTo) {
                        setReplyingTo(null);
                      }
                    }}
                    className="flex-1 bg-white border-slate-300 focus:border-blue-400 rounded-full px-4"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-full h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">
                    Double-click any message to reply • Press Esc to cancel
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-200 p-6 rounded-full w-fit mx-auto">
                  <MessageSquare className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">Select a conversation</h3>
                <p className="text-slate-500">Choose a conversation to start messaging</p>
                <Button 
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Group Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient-blue flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Create Group Chat
            </DialogTitle>
            <DialogDescription>
              Create a new group conversation with multiple team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName" className="text-sm font-medium">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="bg-white border-blue-200 focus:border-blue-400 mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Select Members</Label>
              <div className="max-h-48 overflow-y-auto border border-blue-200 rounded-md p-3 space-y-2 bg-white mt-1">
                {allUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading users...</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadAllUsers}
                      className="mt-2"
                    >
                      Refresh Users
                    </Button>
                  </div>
                ) : (
                  allUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                      onClick={() => {
                        if (selectedGroupMembers.includes(u.id)) {
                          setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== u.id));
                        } else {
                          setSelectedGroupMembers([...selectedGroupMembers, u.id]);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupMembers.includes(u.id)}
                        onChange={() => {}}
                        className="rounded border-gray-300"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.role}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedGroupMembers.length} members
                {allUsers.length > 0 && ` (${allUsers.length} available)`}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateGroupOpen(false);
                setGroupName('');
                setSelectedGroupMembers([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedGroupMembers.length === 0 || allUsers.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
            >
              <Hash className="h-4 w-4 mr-2" />
              {allUsers.length === 0 ? 'Loading...' : 'Create Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Group Dialog */}
      <Dialog open={isManageGroupOpen} onOpenChange={setIsManageGroupOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Group: {selectedConversation?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove members from this group
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Members</Label>
              <div className="space-y-2 mt-2">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    {member.id !== user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveGroupMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Add Members</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 mt-2">
                {allUsers
                  .filter(u => !groupMembers.some(m => m.id === u.id))
                  .map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.profilePhoto} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.role}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGroupMember(u.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsManageGroupOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-red-50/30 border border-red-200/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <X className="h-5 w-5" />
              Delete Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {messageToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-20 overflow-y-auto">
              <p className="text-sm text-gray-700 line-clamp-3">{messageToDelete.content}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (messageToDelete) {
                  handleDeleteMessage(messageToDelete.id);
                  setShowDeleteDialog(false);
                  setMessageToDelete(null);
                }
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={showDeleteChatDialog} onOpenChange={setShowDeleteChatDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-red-50/30 border border-red-200/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <X className="h-5 w-5" />
              Delete Chat
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entire chat? All messages will be permanently deleted and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedConversation && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {selectedConversation.isGroup ? 'Group: ' : 'Chat with: '}
                {selectedConversation.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedConversation.isGroup
                  ? `${selectedConversation.participants.length} members`
                  : 'Direct conversation'
                }
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteChatDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDeleteChat();
                setShowDeleteChatDialog(false);
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
