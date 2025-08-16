
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Bell, Database, Download, Trash2, Volume2, VolumeX, Play } from 'lucide-react';
import { useSoundSettings } from '@/contexts/SoundContext';
import { AudioGenerator } from '@/utils/audioGenerator';

const Settings = () => {
  const { toast } = useToast();
  const { settings: soundSettings, updateSettings: updateSoundSettings, playSuccess, playError } = useSoundSettings();
  
  const [settings, setSettings] = useState({
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
    // Play success sound when settings are saved
    playSuccess();
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

  const handleTestSound = (type: 'success' | 'error') => {
    if (type === 'success') {
      playSuccess();
    } else {
      playError();
    }
  };

  const handleTestGeneratedSound = (type: 'success' | 'error' | 'notification') => {
    if (type === 'success') {
      AudioGenerator.playSuccessSound();
    } else if (type === 'error') {
      AudioGenerator.playErrorSound();
    } else {
      AudioGenerator.playNotificationSound();
    }
  };

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#FFFFFF] flex items-center justify-center gap-3 font-inter">
            <SettingsIcon className="h-8 w-8 text-[#FF7A00]" />
            Settings
          </h1>
          <p className="text-[#E0E0E0]/80">Configure your Amazon scraper preferences</p>
        </div>


        {/* Scraping Configuration */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Database className="h-5 w-5 text-[#FF7A00]" />
              Scraping Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries" className="text-[#E0E0E0]">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxRetries}
                  onChange={(e) => setSettings(prev => ({...prev, maxRetries: parseInt(e.target.value)}))}
                  className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FAFAFA]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDelay" className="text-[#E0E0E0]">Request Delay (ms)</Label>
                <Input
                  id="requestDelay"
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.requestDelay}
                  onChange={(e) => setSettings(prev => ({...prev, requestDelay: parseInt(e.target.value)}))}
                  className="bg-[#1F1F1F] border-[#2A2A2A] text-[#FAFAFA]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[#FAFAFA] font-medium">Default Output Fields</h4>
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
                    <Label htmlFor={field} className="text-[#E0E0E0] capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#FF7A00]" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#E0E0E0]">Enable Notifications</Label>
                <p className="text-sm text-[#E0E0E0]/60">Get notified when scraping completes</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, enableNotifications: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#E0E0E0]">Auto-save Results</Label>
                <p className="text-sm text-[#E0E0E0]/60">Automatically save scraped data to history</p>
              </div>
              <Switch
                checked={settings.autoSaveResults}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, autoSaveResults: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#E0E0E0]">Error Reporting</Label>
                <p className="text-sm text-[#E0E0E0]/60">Send anonymous error reports to improve the service</p>
              </div>
              <Switch
                checked={settings.enableErrorReporting}
                onCheckedChange={(checked) => setSettings(prev => ({...prev, enableErrorReporting: checked}))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-[#FF7A00]" />
              Sound Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#E0E0E0]">Enable Sounds</Label>
                <p className="text-sm text-[#E0E0E0]/60">Play sounds when scraping completes or fails</p>
              </div>
              <Switch
                checked={soundSettings.enableSounds}
                onCheckedChange={(checked) => updateSoundSettings({ enableSounds: checked })}
              />
            </div>
            {soundSettings.enableSounds && (
              <div className="space-y-2">
                <Label htmlFor="soundVolume" className="text-[#E0E0E0]">Sound Volume</Label>
                <div className="flex items-center gap-3">
                  <VolumeX className="h-4 w-4 text-[#A3A3A3]" />
                  <Input
                    id="soundVolume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundSettings.soundVolume}
                    onChange={(e) => updateSoundSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <Volume2 className="h-4 w-4 text-[#A3A3A3]" />
                  <span className="text-sm text-[#E0E0E0] w-12 text-right">
                    {Math.round(soundSettings.soundVolume * 100)}%
                  </span>
                </div>
                <p className="text-sm text-[#E0E0E0]/60">
                  Sounds will play when scraping completes successfully or encounters errors
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestSound('success')}
                    className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8]/10"
                  >
                    Test Success Sound
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestSound('error')}
                    className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                  >
                    Test Error Sound
                  </Button>
                </div>
                
                <div className="border-t border-[#2A2A2A] pt-4 mt-4">
                  <p className="text-sm text-[#E0E0E0]/60 mb-3">
                    Generated Sounds (works without audio files):
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestGeneratedSound('success')}
                      className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8]/10"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Generated Success
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestGeneratedSound('error')}
                      className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Generated Error
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestGeneratedSound('notification')}
                      className="border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600]/10"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Notification
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="dashboard-card border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
              <Database className="h-5 w-5 text-[#FF7A00]" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExportData}
                className="bg-[#FF7A00] hover:bg-[#ff9100] text-white flex-1 shadow-orange-500/50 shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button 
                onClick={handleClearHistory}
                variant="outline"
                className="border-[#EB5F01] text-[#EB5F01] hover:bg-[#1f150a] flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <p className="text-sm text-[#E0E0E0]/60">
              Export your data as CSV or JSON, or clear all stored scraping history.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            className="bg-[#FF7A00] hover:bg-[#ff9100] text-white px-8 py-3 shadow-orange-500/50 shadow-md"
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
