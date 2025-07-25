import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  User,
  Send,
  Calculator,
  DollarSign,
  FileText,
  CheckCircle,
  Sparkles,
  Copy,
  Download
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

interface AIInvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  worker: UserType;
  workOrders: WorkOrder[];
  selectedMonth: string;
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  categoryData?: {
    category: string;
    count: number;
    price?: number;
    total?: number;
  };
}

interface CategoryData {
  category: string;
  count: number;
  price?: number;
  total?: number;
}

export default function AIInvoiceGenerator({
  isOpen,
  onClose,
  worker,
  workOrders,
  selectedMonth
}: AIInvoiceGeneratorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<'analyzing' | 'pricing' | 'completed'>('analyzing');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [invoiceData, setInvoiceData] = useState<{
    categories: CategoryData[];
    grandTotal: number;
    workerName: string;
    month: string;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const addMessage = (type: 'ai' | 'user', content: string, categoryData?: CategoryData) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      categoryData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const typeMessage = async (content: string, delay: number = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage('ai', content);
  };

  const initializeChat = async () => {
    // Analyze worker's approved submissions
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    const monthlyOrders = workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === parseInt(year) &&
             (orderDate.getMonth() + 1) === parseInt(month) &&
             (order.createdBy === worker.id || order.assignedTo === worker.id) &&
             order.status === 'Approved';
    });

    // Group by categories
    const categoryMap: { [category: string]: number } = {};
    monthlyOrders.forEach(order => {
      const category = order.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const detectedCategories: CategoryData[] = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }));

    setCategories(detectedCategories);

    // Start AI conversation
    await typeMessage(`🧠 **MT Web's AI Assistant**\n\nHello! I'm analyzing ${worker.name}'s approved submissions for ${monthName}...`, 500);
    
    if (detectedCategories.length === 0) {
      await typeMessage(`❌ **No Approved Submissions Found**\n\n${worker.name} has no approved submissions for ${monthName}. Cannot generate invoice.`, 1000);
      setCurrentStep('completed');
      return;
    }

    await typeMessage(`✅ **Analysis Complete!**\n\nI found **${monthlyOrders.length} approved submissions** across **${detectedCategories.length} categories**:\n\n${detectedCategories.map(cat => `• **${cat.category}**: ${cat.count} submissions`).join('\n')}\n\nNow I'll ask for pricing for each category.`, 1500);

    setCurrentStep('pricing');
    await askForNextCategoryPrice();
  };

  const askForNextCategoryPrice = async () => {
    if (currentCategoryIndex >= categories.length) {
      await calculateInvoice();
      return;
    }

    const category = categories[currentCategoryIndex];
    await typeMessage(`💰 **Category ${currentCategoryIndex + 1}/${categories.length}**\n\n**${category.category}**: ${category.count} submissions\n\nPlease enter the price per submission for this category:`, 800);
  };

  const handleUserInput = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    addMessage('user', userMessage);
    setCurrentInput('');

    if (currentStep === 'pricing') {
      const price = parseFloat(userMessage);
      if (isNaN(price) || price < 0) {
        await typeMessage('❌ Please enter a valid positive number for the price.', 800);
        return;
      }

      // Update category with price
      const updatedCategories = [...categories];
      updatedCategories[currentCategoryIndex] = {
        ...updatedCategories[currentCategoryIndex],
        price,
        total: updatedCategories[currentCategoryIndex].count * price
      };
      setCategories(updatedCategories);

      const category = updatedCategories[currentCategoryIndex];
      await typeMessage(`✅ **Price Set**\n\n**${category.category}**:\n• ${category.count} submissions × $${price.toFixed(2)} = **$${category.total!.toFixed(2)}**`, 1000);

      setCurrentCategoryIndex(prev => prev + 1);
      await askForNextCategoryPrice();
    }
  };

  const calculateInvoice = async () => {
    const grandTotal = categories.reduce((sum, cat) => sum + (cat.total || 0), 0);
    
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    const invoice = {
      categories,
      grandTotal,
      workerName: worker.name,
      month: monthName
    };

    setInvoiceData(invoice);
    setCurrentStep('completed');

    await typeMessage(`🎉 **Invoice Generated Successfully!**\n\n**Worker**: ${worker.name}\n**Period**: ${monthName}\n\n**Breakdown by Category**:\n${categories.map(cat => 
      `• **${cat.category}**: ${cat.count} × $${cat.price!.toFixed(2)} = $${cat.total!.toFixed(2)}`
    ).join('\n')}\n\n**Grand Total**: **$${grandTotal.toFixed(2)}**`, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const copyInvoiceData = () => {
    if (!invoiceData) return;
    
    const text = `Invoice for ${invoiceData.workerName} - ${invoiceData.month}\n\n` +
      invoiceData.categories.map(cat => 
        `${cat.category}: ${cat.count} × $${cat.price!.toFixed(2)} = $${cat.total!.toFixed(2)}`
      ).join('\n') +
      `\n\nGrand Total: $${invoiceData.grandTotal.toFixed(2)}`;
    
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-6 w-6 text-blue-600" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            MT Web's AI - Invoice Generator
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Generating invoice for {worker.name}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'ai'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white ml-auto'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {currentStep === 'pricing' && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter price per submission..."
                className="flex-1"
                type="number"
                step="0.01"
                min="0"
              />
              <Button onClick={handleUserInput} disabled={!currentInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'completed' && invoiceData && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Button onClick={copyInvoiceData} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Invoice
              </Button>
              <Button onClick={onClose} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
