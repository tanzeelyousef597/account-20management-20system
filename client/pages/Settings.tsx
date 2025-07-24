import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon,
  MessageCircle,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface WhatsAppSettings {
  adminWhatsAppNumber: string;
  messageTemplate: string;
  isEnabled: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings>({
    adminWhatsAppNumber: '+923189046142',
    messageTemplate: 'An order has been assigned to you by [Admin Name]. The due date is [Due Date].',
    isEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/whatsapp');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSaved(false);

    try {
      const response = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can access settings
  if (user?.role !== 'Admin') {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access settings. Only administrators can modify system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
      </div>

      {/* WhatsApp Configuration */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Messaging Configuration
          </CardTitle>
          <CardDescription>
            Configure WhatsApp messaging for order assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSaved && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Settings saved successfully!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="adminWhatsAppNumber">Admin WhatsApp Number</Label>
                <Input
                  id="adminWhatsAppNumber"
                  type="tel"
                  placeholder="+923189046142"
                  value={settings.adminWhatsAppNumber}
                  onChange={(e) => setSettings({...settings, adminWhatsAppNumber: e.target.value})}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This number will be used to send WhatsApp messages when orders are assigned. 
                  Format: +country code + number
                </p>
              </div>

              <div>
                <Label htmlFor="messageTemplate">Message Template</Label>
                <Textarea
                  id="messageTemplate"
                  placeholder="Enter your message template..."
                  value={settings.messageTemplate}
                  onChange={(e) => setSettings({...settings, messageTemplate: e.target.value})}
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available placeholders: [Admin Name], [Due Date], [Worker Name], [Order Title]
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={settings.isEnabled}
                  onChange={(e) => setSettings({...settings, isEnabled: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isEnabled" className="text-sm">
                  Enable WhatsApp messaging for order assignments
                </Label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Message Preview</CardTitle>
          <CardDescription>
            Preview of how the WhatsApp message will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">From: {settings.adminWhatsAppNumber}</p>
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <p className="text-gray-900">
                {settings.messageTemplate
                  .replace('[Admin Name]', user?.name || 'Admin User')
                  .replace('[Due Date]', 'January 15, 2024')
                  .replace('[Worker Name]', 'John Doe')
                  .replace('[Order Title]', 'Sample Work Order')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
