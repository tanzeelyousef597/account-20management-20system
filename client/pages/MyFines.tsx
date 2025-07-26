import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  DollarSign,
  Calendar,
  TrendingDown,
  FileText,
  Info
} from 'lucide-react';
import { Fine } from '@shared/types';

export default function MyFines() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [fines, setFines] = useState<Fine[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyFines();
    }
  }, [user]);

  const fetchMyFines = async () => {
    try {
      const response = await fetch(`/api/fines/worker/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setFines(data);
      }
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
  const thisMonthFines = fines.filter(fine => 
    new Date(fine.createdAt).getMonth() === new Date().getMonth() &&
    new Date(fine.createdAt).getFullYear() === new Date().getFullYear()
  ).reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Fines</h2>
        <p className="text-gray-600 mt-1">View any fines issued to your account</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Fines</p>
                <p className="text-2xl font-bold text-red-900">{fines.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Total Amount</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(totalFines)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">This Month</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(thisMonthFines)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {fines.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Info className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Great Job!</h3>
                <p className="text-green-700">You have no fines on your account. Keep up the excellent work!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fines Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Fine History
          </CardTitle>
          <CardDescription>
            Details of any fines issued to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Issued By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-base px-3 py-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(fine.amount)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {fine.reason}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(fine.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 font-medium">{fine.createdBy}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <div className="relative">
                <AlertCircle className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No fines issued</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Excellent! You have maintained a clean record with no fines. 
                Continue following guidelines to keep your record spotless.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {fines.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Improvement Opportunity</h3>
                <p className="text-blue-100">
                  Learn from past mistakes and continue improving your performance. 
                  Total fines: {formatCurrency(totalFines)}
                </p>
              </div>
              <TrendingDown className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
