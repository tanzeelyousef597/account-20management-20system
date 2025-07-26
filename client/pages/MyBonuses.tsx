import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Gift,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Bonus } from '@shared/types';

export default function MyBonuses() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyBonuses();
    }
  }, [user]);

  const fetchMyBonuses = async () => {
    try {
      const response = await fetch(`/api/bonuses/worker/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBonuses(data);
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error);
    }
  };

  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  const thisMonthBonuses = bonuses.filter(bonus => 
    bonus.month === new Date().toISOString().slice(0, 7)
  ).reduce((sum, bonus) => sum + bonus.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Bonuses</h2>
        <p className="text-gray-600 mt-1">View your performance bonuses and rewards</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Bonuses</p>
                <p className="text-2xl font-bold text-green-900">{bonuses.length}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Amount</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalBonuses)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">This Month</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(thisMonthBonuses)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonuses Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus History
          </CardTitle>
          <CardDescription>
            Your complete bonus history and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonuses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Awarded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-base px-3 py-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(bonus.amount)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{bonus.month} {bonus.year}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {bonus.reason}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">
                        {new Date(bonus.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No bonuses yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Keep up the great work! Bonuses will appear here when awarded by your administrator for excellent performance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {bonuses.length > 0 && (
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                <p className="text-green-100">
                  You've earned {formatCurrency(totalBonuses)} in total bonuses. 
                  Keep up the excellent work!
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
