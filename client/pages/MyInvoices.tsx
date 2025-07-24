import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Gift,
  AlertCircle
} from 'lucide-react';
import { Invoice } from '@shared/types';

export default function MyInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyInvoices();
    }
  }, [user]);

  const fetchMyInvoices = async () => {
    try {
      const response = await fetch(`/api/invoices/worker/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`);
    // In production, generate and download PDF/Excel file
  };

  const totalEarnings = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalApprovedSubmissions = invoices.reduce((sum, invoice) => sum + invoice.submissionCount, 0);
  const thisMonthInvoices = invoices.filter(invoice =>
    invoice.month === new Date().toISOString().slice(0, 7)
  );
  const thisMonthEarnings = thisMonthInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Invoices</h2>
        <p className="text-gray-600 mt-1">View your monthly invoices and payment details</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-900">{invoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Earnings</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">This Month</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(thisMonthEarnings)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Approved Submissions</p>
                <p className="text-2xl font-bold text-yellow-900">{totalApprovedSubmissions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>
            Your complete payment history and invoice details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Payment Breakdown</TableHead>
                  <TableHead>Adjustments</TableHead>
                  <TableHead>Total Amount</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{invoice.month} {invoice.year}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">{invoice.submissionCount} approved</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Fixed Pay:</span>
                          <span className="font-medium">{formatCurrency(invoice.fixedPay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Work Pay:</span>
                          <span className="font-medium">{formatCurrency(invoice.workPay)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {invoice.bonus > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <div className="flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              <span>Bonus:</span>
                            </div>
                            <span className="font-medium">+{formatCurrency(invoice.bonus)}</span>
                          </div>
                        )}
                        {invoice.fine > 0 && (
                          <div className="flex items-center justify-between text-red-600">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>Fine:</span>
                            </div>
                            <span className="font-medium">-{formatCurrency(invoice.fine)}</span>
                          </div>
                        )}
                        {invoice.bonus === 0 && invoice.fine === 0 && (
                          <span className="text-gray-500">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your invoices will appear here once they are generated by the administrator. 
                Continue submitting quality work to earn payments!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {invoices.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-blue-100 text-sm font-medium">Average Monthly Earnings</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.round(totalEarnings / Math.max(invoices.length, 1)))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm font-medium">Total Submissions Approved</p>
                <p className="text-2xl font-bold">{totalApprovedSubmissions}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm font-medium">Working Months</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
