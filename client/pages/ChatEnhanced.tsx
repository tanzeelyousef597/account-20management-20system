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
import {
  Search,
  Send,
  Users,
  X,
  CheckCheck,
  Check,
  Reply,
  Edit3,
  Trash2,
  UserPlus,
  Hash,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const [users, setUsers] = useState<User[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await api.get(`/chat/conversations/${selectedConversation.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo(message);
    document.getElementById('message-input')?.focus();
  };

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessage(message);
    setEditText(message.content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      if (response.ok) {
        loadMessages();
        toast({ title: 'Message deleted', variant: 'default' });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ title: 'Failed to delete message', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    
    try {
      const response = await api.put(`/chat/messages/${editingMessage.id}`, {
        content: editText.trim()
      });
      
      if (response.ok) {
        setEditingMessage(null);
        setEditText('');
        loadMessages();
        toast({ title: 'Message updated', variant: 'default' });
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast({ title: 'Failed to update message', variant: 'destructive' });
    }
  };

  const handleClearChat = async () => {
    if (!selectedConversation || !confirm('Are you sure you want to clear this entire chat? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/chat/conversations/${selectedConversation.id}/messages`);
      if (response.ok) {
        setMessages([]);
        toast({ title: 'Chat cleared', variant: 'default' });
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({ title: 'Failed to clear chat', variant: 'destructive' });
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      toast({ title: 'Please enter group name and select members', variant: 'destructive' });
      return;
    }
    
    try {
      const response = await api.post('/chat/groups', {
        name: groupName.trim(),
        members: [...selectedGroupMembers, user!.id]
      });
      
      if (response.ok) {
        setIsCreateGroupOpen(false);
        setGroupName('');
        setSelectedGroupMembers([]);
        loadConversations();
        toast({ title: 'Group created successfully', variant: 'default' });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: 'Failed to create group', variant: 'destructive' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData: any = {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
      };
      
      // Add reply reference if replying to a message
      if (replyingTo) {
        messageData.replyToId = replyingTo.id;
      }
      
      const response = await api.post('/chat/send', messageData);

      if (response.ok) {
        setNewMessage('');
        setReplyingTo(null);
        loadMessages();
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700">
            Enhanced Chat System
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Communicate with team members, reply to messages, and create groups
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-xl border border-slate-200/60 shadow-lg backdrop-blur-sm h-[600px] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-gradient-to-br from-white to-slate-50/50 border-r border-slate-200/60 flex flex-col rounded-l-xl">
          <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <h3 className="font-semibold text-slate-700">Conversations</h3>
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsCreateGroupOpen(true)} 
                title="Create group"
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsSearching(!isSearching)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
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
                  className="flex-1"
                />
                <Button size="sm" onClick={() => {/* Add search logic */}}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border border-slate-200/60",
                    selectedConversation?.id === conversation.id
                      ? "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300"
                      : "bg-white hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30"
                  )}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {conversation.isGroup ? (
                          <Hash className="h-4 w-4" />
                        ) : (
                          getUserInitials(conversation.name || 'U')
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {conversation.isGroup && '# '}{conversation.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50/20 rounded-r-xl">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200/50 bg-gradient-to-r from-white/80 to-blue-50/30 backdrop-blur-sm rounded-tr-xl">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedConversation.isGroup ? (
                      <Hash className="h-4 w-4" />
                    ) : (
                      getUserInitials(selectedConversation.name || 'U')
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700">
                      {selectedConversation.isGroup && '# '}{selectedConversation.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.participantNames?.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearChat}
                    title="Clear chat"
                    className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
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
                        className={cn(
                          'flex group',
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        )}
                        onDoubleClick={() => handleReplyToMessage(message)}
                      >
                        <div className="relative max-w-xs lg:max-w-md">
                          {/* Reply indicator */}
                          {message.replyTo && (
                            <div className="mb-2 pl-4 border-l-2 border-blue-300 bg-blue-50/50 rounded p-2">
                              <p className="text-xs text-blue-600 font-medium">
                                Replying to {message.replyTo.senderName === user?.name ? 'You' : message.replyTo.senderName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {message.replyTo.content}
                              </p>
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              'px-4 py-2 rounded-lg relative shadow-sm',
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-700'
                            )}
                          >
                            {/* Sender name for group chats */}
                            {selectedConversation?.isGroup && !isOwnMessage && (
                              <p className="text-xs font-medium text-slate-600 mb-1">
                                {senderName}
                              </p>
                            )}
                            
                            {/* Message content or edit input */}
                            {editingMessage?.id === message.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="text-sm bg-white"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEdit();
                                    } else if (e.key === 'Escape') {
                                      setEditingMessage(null);
                                      setEditText('');
                                    }
                                  }}
                                />
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={handleSaveEdit}>
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingMessage(null);
                                      setEditText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                            
                            {/* Message actions */}
                            <div className="absolute -right-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-blue-50"
                                onClick={() => handleReplyToMessage(message)}
                                title="Reply to message"
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                              {isOwnMessage && editingMessage?.id !== message.id && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-yellow-50"
                                    onClick={() => handleEditMessage(message)}
                                    title="Edit message"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-red-50 text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    title="Delete message"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className={cn(
                                'text-xs',
                                isOwnMessage ? 'text-blue-100' : 'text-slate-500'
                              )}>
                                {formatTime(message.timestamp)}
                                {message.edited && (
                                  <span className="ml-1 italic">(edited)</span>
                                )}
                              </p>
                              {isOwnMessage && (
                                <div className="ml-2">
                                  {message.readBy && message.readBy.length > 1 ? (
                                    <CheckCheck className="h-3 w-3 text-blue-200" />
                                  ) : (
                                    <Check className="h-3 w-3 text-blue-200" />
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
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Replying to {replyingTo.senderName === user?.name ? 'yourself' : replyingTo.senderName}
                        </p>
                        <p className="text-sm text-slate-500 truncate max-w-md">
                          {replyingTo.content}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Input
                    id="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={replyingTo ? 'Reply to message...' : 'Type a message...'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                      } else if (e.key === 'Escape' && replyingTo) {
                        setReplyingTo(null);
                      }
                    }}
                    className="flex-1 bg-white border-slate-300 focus:border-blue-400"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-slate-500 mt-2">
                  Double-click on any message to reply • Press Escape to cancel reply
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-full w-fit mx-auto">
                  <MessageSquare className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">Select a conversation</h3>
                <p className="text-slate-500">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/60">
          <DialogHeader>
            <DialogTitle className="text-gradient-blue">Create Group Chat</DialogTitle>
            <DialogDescription>
              Create a new group conversation with multiple members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="bg-white border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <Label>Select Members</Label>
              <div className="max-h-48 overflow-y-auto border border-blue-200 rounded-md p-2 space-y-2 bg-white">
                {users.filter(u => u.id !== user?.id).map((u) => (
                  <div key={u.id} className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedGroupMembers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroupMembers([...selectedGroupMembers, u.id]);
                        } else {
                          setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== u.id));
                        }
                      }}
                    />
                    <span className="text-sm">{u.name} ({u.role})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
