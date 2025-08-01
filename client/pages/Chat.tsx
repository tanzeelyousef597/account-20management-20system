import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@shared/api-client';
import { ChatConversation, ChatMessage, User } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image, 
  MoreVertical, 
  Phone,
  Video,
  Users,
  X,
  CheckCheck,
  Check,
  Circle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const { user } = useAuth();
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.participants.find(p => p.id !== user?.id)?.id || '');
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await api.getConversations(user.id);
      setConversations(data);
      
      // Load online status for all participants
      const allUserIds = data.flatMap(conv => 
        conv.participants.filter(p => p.id !== user.id).map(p => p.id)
      );
      if (allUserIds.length > 0) {
        const status = await api.getOnlineStatus(allUserIds);
        setOnlineStatus(status);
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

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      const response = await api.getMessages(user.id, otherUserId);
      setMessages(response.messages);
      
      // Mark messages as read
      await api.markMessagesAsRead(user.id, otherUserId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.participants.some(p => p.id === otherUserId)
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
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

    const otherUser = selectedConversation.participants.find(p => p.id !== user.id);
    if (!otherUser) return;

    try {
      const message = await api.sendMessage(user.id, {
        receiverId: otherUser.id,
        content: newMessage.trim(),
        messageType: 'text',
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: message, lastActivity: message.timestamp }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
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

    // Check if conversation already exists
    let existingConv = conversations.find(conv => 
      conv.participants.some(p => p.id === targetUser.id)
    );

    if (!existingConv) {
      // Create new conversation by sending a message
      try {
        await api.sendMessage(user.id, {
          receiverId: targetUser.id,
          content: `Hello ${targetUser.name}! 👋`,
          messageType: 'text',
        });
        
        // Reload conversations to get the new one
        await loadConversations();
        
        // Find the new conversation
        existingConv = conversations.find(conv => 
          conv.participants.some(p => p.id === targetUser.id)
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

  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!selectedConversation || !user) return;

    // Check file size (2GB limit)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 2GB',
        variant: 'destructive',
      });
      return;
    }

    const otherUser = selectedConversation.participants.find(p => p.id !== user.id);
    if (!otherUser) return;

    setIsUploading(true);
    try {
      // Upload the file
      const uploadResponse = await api.uploadChatFile(type);

      // Send message with file
      const message = await api.sendMessage(user.id, {
        receiverId: otherUser.id,
        content: file.name,
        messageType: type,
        fileUrl: uploadResponse.url,
        fileName: uploadResponse.fileName,
        fileSize: file.size,
      });

      setMessages(prev => [...prev, message]);

      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: message, lastActivity: message.timestamp }
            : conv
        )
      );

      toast({
        title: 'File Shared',
        description: `${type === 'image' ? 'Image' : 'File'} shared successfully`,
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, 'image');
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file',
        variant: 'destructive',
      });
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'file');
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const conversationsList = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat</h2>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search for users */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email to start chat..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearchUser} 
              disabled={isSearching || !searchEmail.trim()}
              size="sm"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedUser && (
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedUser.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{selectedUser.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleStartChat(selectedUser)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs">Search for a user to start chatting</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.participants.find(p => p.id !== user?.id);
              if (!otherUser) return null;

              const isOnline = onlineStatus[otherUser.id];
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setIsMobileConversationOpen(true);
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.profilePhoto} />
                      <AvatarFallback>
                        {getUserInitials(otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{otherUser.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 px-2 py-0.5 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const chatArea = selectedConversation ? (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileConversationOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {(() => {
            const otherUser = selectedConversation.participants.find(p => p.id !== user?.id);
            if (!otherUser) return null;
            
            const isOnline = onlineStatus[otherUser.id];
            
            return (
              <>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.profilePhoto} />
                    <AvatarFallback>
                      {getUserInitials(otherUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{otherUser.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle className={cn(
                      "h-2 w-2 fill-current",
                      isOnline ? "text-green-500" : "text-gray-400"
                    )} />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  isOwn ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={selectedConversation.participants.find(p => p.id === message.senderId)?.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-full",
                  isOwn 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  {message.messageType === 'text' && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}
                  
                  {message.messageType === 'image' && (
                    <div>
                      <img 
                        src={message.fileUrl} 
                        alt="Shared image" 
                        className="rounded max-w-full h-auto max-h-64 object-cover"
                      />
                      {message.content && (
                        <p className="text-sm mt-2 break-words">{message.content}</p>
                      )}
                    </div>
                  )}
                  
                  {message.messageType === 'file' && (
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">{message.fileName}</div>
                        <div className="text-xs opacity-70">
                          {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex items-center justify-between mt-1 gap-2",
                    isOwn ? "flex-row-reverse" : ""
                  )}>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwn && (
                      <div className="opacity-70">
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
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Image className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-center p-8">
      <div>
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
        <p className="text-muted-foreground max-w-sm">
          Select a conversation from the sidebar or search for a user by email to start chatting.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-lg border bg-card">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r">
          {conversationsList}
        </div>
        
        {/* Chat Area */}
        <div className="flex-1">
          {chatArea}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full">
        {!isMobileConversationOpen ? (
          conversationsList
        ) : (
          chatArea
        )}
      </div>
    </div>
  );
}
