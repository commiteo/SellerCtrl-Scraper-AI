import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { telegramService, TelegramConfig } from '@/services/TelegramService';
import { Bot, MessageSquare, Settings, TestTube, Bell, BellOff } from 'lucide-react';

const TelegramSettings: React.FC = () => {
  const [config, setConfig] = useState<TelegramConfig>({
    bot_token: '',
    chat_id: '',
    is_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const loadedConfig = await telegramService.loadConfig();
      if (loadedConfig) {
        setConfig(loadedConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load Telegram configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.bot_token || !config.chat_id) {
      toast({
        title: "Validation Error",
        description: "Bot Token and Chat ID are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const success = await telegramService.saveConfig(config);
      
      if (success) {
        toast({
          title: "Success",
          description: "Telegram configuration saved successfully",
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save Telegram configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const success = await telegramService.testConnection();
      
      if (success) {
        toast({
          title: "Test Successful",
          description: "Telegram message sent successfully! Check your chat.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Failed to send Telegram message. Check your configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Test Error",
        description: "Error testing Telegram connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, is_enabled: enabled }));
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
        <div className="max-w-4xl mx-auto">
          <div className="text-[#E0E0E0] text-center">Loading Telegram settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#FF7A00]" />
          <div>
            <h1 className="text-2xl font-bold text-[#FFFFFF]">Telegram Notifications</h1>
            <p className="text-[#A3A3A3]">Configure Telegram bot for Buy Box and price alerts</p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={config.is_enabled ? "default" : "secondary"}>
                  {config.is_enabled ? (
                    <>
                      <Bell className="w-3 h-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3 h-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
                <span className="text-[#A3A3A3] text-sm">
                  {config.is_enabled ? 'Notifications are active' : 'Notifications are disabled'}
                </span>
              </div>
              <Switch
                checked={config.is_enabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-[#FF7A00]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bot Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bot Token */}
            <ValidatedInput
              fieldName="bot_token"
              label="Bot Token"
              type="password"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              value={config.bot_token}
              onChange={(value) => setConfig(prev => ({ ...prev, bot_token: value }))}
              schema={{
                bot_token: {
                  required: true,
                  type: 'telegram_token' as const,
                  message: 'Please enter a valid Telegram bot token'
                }
              }}
              className="bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0]"
              helperText="Get this from @BotFather on Telegram"
              required
            />

            {/* Chat ID */}
            <ValidatedInput
              fieldName="chat_id"
              label="Chat ID"
              placeholder="123456789 or @channel_username"
              value={config.chat_id}
              onChange={(value) => setConfig(prev => ({ ...prev, chat_id: value }))}
              schema={{
                chat_id: {
                  required: true,
                  type: 'telegram_chat_id' as const,
                  message: 'Please enter a valid chat ID or channel username'
                }
              }}
              className="bg-[#1F1F1F] border-[#2A2A2A] text-[#E0E0E0]"
              helperText="Your personal chat ID or channel username (with @)"
              required
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !config.bot_token || !config.chat_id}
                className="bg-[#FF7A00] text-white hover:bg-[#ff8c1a]"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
              
              <Button
                onClick={handleTest}
                disabled={testing || !config.bot_token || !config.chat_id || !config.is_enabled}
                variant="outline"
                className="border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-[#E0E0E0] font-semibold">1. Create a Telegram Bot</h4>
              <ol className="list-decimal list-inside space-y-1 text-[#A3A3A3] text-sm">
                <li>Open Telegram and search for @BotFather</li>
                <li>Send /newbot command</li>
                <li>Follow the instructions to create your bot</li>
                <li>Copy the bot token (looks like: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)</li>
              </ol>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            <div className="space-y-3">
              <h4 className="text-[#E0E0E0] font-semibold">2. Get Your Chat ID</h4>
              <ol className="list-decimal list-inside space-y-1 text-[#A3A3A3] text-sm">
                <li>Send a message to your bot</li>
                <li>Visit: https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</li>
                <li>Find your chat_id in the response</li>
                <li>Or use @userinfobot to get your ID</li>
              </ol>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            <div className="space-y-3">
              <h4 className="text-[#E0E0E0] font-semibold">3. Configure Notifications</h4>
              <ol className="list-decimal list-inside space-y-1 text-[#A3A3A3] text-sm">
                <li>Enter your bot token above</li>
                <li>Enter your chat ID</li>
                <li>Enable notifications</li>
                <li>Test the connection</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Alert Types Card */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="text-[#E0E0E0] font-semibold">Buy Box Lost</h4>
                </div>
                <p className="text-[#A3A3A3] text-sm">
                  When your product loses the Buy Box to another seller
                </p>
              </div>

              <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="text-[#E0E0E0] font-semibold">Buy Box Won</h4>
                </div>
                <p className="text-[#A3A3A3] text-sm">
                  When you win the Buy Box for a product
                </p>
              </div>

              <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="text-[#E0E0E0] font-semibold">Price Changes</h4>
                </div>
                <p className="text-[#A3A3A3] text-sm">
                  When product prices change significantly
                </p>
              </div>

              <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="text-[#E0E0E0] font-semibold">System Updates</h4>
                </div>
                <p className="text-[#A3A3A3] text-sm">
                  Important system notifications and updates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Alert className="border-[#2A2A2A] bg-[#1F1F1F]">
          <Bell className="h-4 w-4" />
          <AlertDescription className="text-[#A3A3A3]">
            <strong className="text-[#E0E0E0]">Important:</strong> Notifications will only be sent for products where you are NOT the current Buy Box seller. 
            This prevents spam when you win the Buy Box yourself.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default TelegramSettings;