import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency, availableCurrencies } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon,
  DollarSign,
  Save,
  CheckCircle,
  AlertCircle,
  Globe,
  User
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Update currency setting
      setCurrency(selectedCurrency);
      
      // Simulate API call for other settings if needed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      setError('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access settings. Only administrators can modify system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600 mt-1">Manage global system configuration and preferences</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isSaved && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully! Changes have been applied system-wide.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Currency Configuration
            </CardTitle>
            <CardDescription>
              Set the global currency for all financial calculations and displays throughout the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveSettings}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableCurrencies).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{info.symbol}</span>
                            <span>{code}</span>
                            <span className="text-gray-500">- {info.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    This currency will be used for all invoices, bonuses, fines, and payments
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sample Invoice Amount:</span>
                      <span className="font-semibold">
                        {availableCurrencies[selectedCurrency as keyof typeof availableCurrencies]?.symbol}1,250.00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sample Bonus:</span>
                      <span className="font-semibold text-green-600">
                        {availableCurrencies[selectedCurrency as keyof typeof availableCurrencies]?.symbol}500.00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sample Fine:</span>
                      <span className="font-semibold text-red-600">
                        -{availableCurrencies[selectedCurrency as keyof typeof availableCurrencies]?.symbol}100.00
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || selectedCurrency === currency}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Currency Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Current Currency</span>
                </div>
                <div className="text-sm">
                  <span className="font-mono mr-1">
                    {availableCurrencies[currency as keyof typeof availableCurrencies]?.symbol}
                  </span>
                  <span className="font-semibold">{currency}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Current Admin</span>
                </div>
                <span className="text-sm font-semibold">{user.name}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <span className="text-sm font-semibold text-green-600">Active</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Currency changes will affect all existing financial data displays. 
                Historical data will be shown in the new currency format.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
