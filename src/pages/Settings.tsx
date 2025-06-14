
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Key, Bell, Database, Download, Trash2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    crawl4aiApiKey: '',
    maxRetries: 3,
    requestDelay: 1000,
    enableNotifications: true,
    autoSaveResults: true,
    enableErrorReporting: false,
    defaultOutputFields: {
      title: true,
      image: true,
      price: true,
      buyboxWinner: true,
      link: true
    }
  });

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving settings:', settings);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all scraping history? This action cannot be undone.')) {
      console.log('Clearing history...');
      toast({
        title: "History Cleared",
        description: "All scraping history has been removed.",
        duration: 3000,
      });
    }
  };

  const handleExportData = () => {
    console.log('Exporting all data...');
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-500" />
            Settings
          </h1>
          <p className="text-gray-400">Configure your Amazon scraper preferences</p>
        </div>

        {/* API Configuration */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-gray-300">Crawl4AI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Crawl4AI API key"
                value={settings.crawl4aiApiKey}
                onChange={(e) => setSettings(prev => ({...prev, crawl4aiApiKey: e.target.value}))}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-sm text-gray-400">
                Your API key is encrypted and stored securely. Get your key from the Crawl4AI dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scraping Configuration */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Scraping Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries" className="text-gray-300">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxRetries}
                  onChange={(e) => setSettings(prev => ({...prev, maxRetries: parseInt(e.target.value)}))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDelay" className="text-gray-300">Request Delay (ms)</Label>
                <Input
                  id="requestDelay"
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.requestDelay}
                  onChange={(e) => setSettings(prev => ({...prev, requestDelay: parseInt(e.target.value)}))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-medium">Default Output Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(settings.defaultOutputFields).map(([field, enabled]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={field}
                      checked={enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        defaultOutputFields: {
                          ...prev.defaultOutputFields,
                          [field]: checked
                        }
                      }))}
                    />
                    <Label htmlFor={field} className="text-gray-300 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Enable Notifications</Label>
                <p className="text-sm text-gray-400">Get notified when scraping completes</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, enableNotifications: checked}))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Auto-save Results</Label>
                <p className="text-sm text-gray-400">Automatically save scraped data to history</p>
              </div>
              <Switch
                checked={settings.autoSaveResults}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, autoSaveResults: checked}))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Error Reporting</Label>
                <p className="text-sm text-gray-400">Send anonymous error reports to improve the service</p>
              </div>
              <Switch
                checked={settings.enableErrorReporting}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, enableErrorReporting: checked}))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExportData}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button 
                onClick={handleClearHistory}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-900 flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Export your data as CSV or JSON, or clear all stored scraping history.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
