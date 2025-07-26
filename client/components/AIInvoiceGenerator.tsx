import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
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
  Calculator,
  DollarSign,
  FileText,
  CheckCircle,
  Sparkles,
  Copy,
  X
} from 'lucide-react';
import { WorkOrder, User as UserType } from '@shared/types';

interface AIInvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  worker: UserType;
  workOrders: WorkOrder[];
  selectedMonth: string;
}

interface CategoryData {
  category: string;
  count: number;
  price: string;
  total: number;
}

export default function AIInvoiceGenerator({
  isOpen,
  onClose,
  worker,
  workOrders,
  selectedMonth
}: AIInvoiceGeneratorProps) {
  const { formatAmount, currency } = useCurrency();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [showTotal, setShowTotal] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      analyzeWorkerSubmissions();
    }
  }, [isOpen, worker, workOrders, selectedMonth]);

  const analyzeWorkerSubmissions = () => {
    const [year, month] = selectedMonth.split('-');
    
    // Filter approved submissions for this worker in the selected month
    const approvedSubmissions = workOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === parseInt(year) &&
             (orderDate.getMonth() + 1) === parseInt(month) &&
             (order.createdBy === worker.id || order.assignedTo === worker.id) &&
             order.status === 'Approved';
    });

    // Group by categories and sum submissions
    const categoryMap: { [category: string]: number } = {};
    approvedSubmissions.forEach(order => {
      const category = order.category || 'Uncategorized';
      const submissions = order.payRate || 1; // payRate stores the number of submissions
      categoryMap[category] = (categoryMap[category] || 0) + submissions;
    });

    // Convert to CategoryData array
    const detectedCategories: CategoryData[] = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
      price: '',
      total: 0
    }));

    setCategories(detectedCategories);
    setShowTotal(false);
    setGrandTotal(0);
  };

  const updateCategoryPrice = (index: number, price: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      price,
      total: parseFloat(price) * updatedCategories[index].count || 0
    };
    setCategories(updatedCategories);
  };

  const calculateInvoiceTotal = () => {
    // Validate all prices are entered
    const invalidCategories = categories.filter(cat => !cat.price.trim() || isNaN(parseFloat(cat.price)) || parseFloat(cat.price) < 0);
    
    if (invalidCategories.length > 0) {
      alert('Please enter valid prices for all categories before generating the invoice.');
      return;
    }

    // Calculate grand total
    const total = categories.reduce((sum, cat) => sum + cat.total, 0);
    setGrandTotal(total);
    setShowTotal(true);
  };

  const copyInvoiceData = () => {
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    const invoiceText = `Invoice for ${worker.name} - ${monthName}\n\n` +
      categories.map(cat =>
        `${cat.category}: ${cat.count} x ${parseFloat(cat.price).toFixed(2)} = ${formatAmount(cat.total)}`
      ).join('\n') +
      `\n-------------------------------\nGrand Total: ${formatAmount(grandTotal)}`;
    
    navigator.clipboard.writeText(invoiceText);
    alert('Invoice data copied to clipboard!');
  };

  const [year, month] = selectedMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[700px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  🧠 MT Web's AI
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Invoice Generator for <span className="font-semibold">{worker.name}</span> - {monthName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {categories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Submissions</h3>
                <p className="text-gray-500">
                  {worker.name} has no approved submissions for {monthName}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Approved Submissions by Category
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    {categories.map((category, index) => (
                      <Card key={category.category} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between gap-6">
                            {/* Category Info */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  📂 {category.category}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-gray-600">
                                    Approved Submissions: <span className="font-semibold text-green-600">{category.count}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price Input */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  💰 Price per Submission
                                </label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="8.50"
                                    value={category.price}
                                    onChange={(e) => updateCategoryPrice(index, e.target.value)}
                                    className="pl-10 w-32 text-center font-semibold"
                                  />
                                </div>
                              </div>

                              {/* Total Display */}
                              {category.price && !isNaN(parseFloat(category.price)) && (
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Total</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {formatAmount(category.total)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer with Generate Button */}
              <div className="p-6 border-t bg-gray-50">
                {!showTotal ? (
                  <div className="text-center">
                    <Button
                      onClick={calculateInvoiceTotal}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                      size="lg"
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                      🔘 Generate Invoice Total
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Separator />
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Invoice Calculation
                      </h4>
                      
                      <div className="space-y-3">
                        {categories.map((category, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{category.category}:</span>
                            <span className="font-mono text-gray-600">
                              {category.count} x {parseFloat(category.price).toFixed(2)} = {formatAmount(category.total)}
                            </span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">🧾 Grand Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            {grandTotal.toFixed(2)} PKR
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={copyInvoiceData}
                        variant="outline"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Invoice Data
                      </Button>
                      <Button
                        onClick={onClose}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
