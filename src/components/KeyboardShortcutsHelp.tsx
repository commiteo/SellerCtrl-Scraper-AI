/**
 * Keyboard Shortcuts Help Component
 * Displays available keyboard shortcuts in a modal
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Navigation, Zap, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onOpenChange,
}) => {
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      icon: <Navigation className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Ctrl', 'H'], description: 'Go to Home' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Go to Scraper' },
        { keys: ['Ctrl', 'Shift', 'H'], description: 'Go to History' },
        { keys: ['Ctrl', 'M'], description: 'Go to Price Monitor' },
        { keys: ['Ctrl', 'Shift', 'A'], description: 'Go to Analytics' },
        { keys: ['Ctrl', 'G'], description: 'Go to Settings' },
        { keys: ['Ctrl', 'T'], description: 'Go to Telegram Settings' },
        { keys: ['Ctrl', 'Shift', 'D'], description: 'Go to Multi-Domain Scraper' },
      ],
    },
    {
      title: 'Actions',
      icon: <Zap className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Ctrl', 'N'], description: 'Start New Scrape' },
        { keys: ['Ctrl', 'E'], description: 'Export Data (History page)' },
        { keys: ['Ctrl', 'R'], description: 'Refresh Page' },
        { keys: ['Ctrl', 'Shift', 'F'], description: 'Focus Search' },
      ],
    },
    {
      title: 'Help',
      icon: <HelpCircle className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Shift', '?'], description: 'Show Keyboard Shortcuts' },
        { keys: ['F1'], description: 'Show Keyboard Shortcuts' },
      ],
    },
  ];

  const renderKeys = (keys: string[]) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Badge
            variant="outline"
            className="px-2 py-1 text-xs font-mono bg-muted/50 border-muted-foreground/20"
          >
            {key}
          </Badge>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Navigation</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Home</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 1</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Amazon Scraper</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 2</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Noon Scraper</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 3</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">History</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 4</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Competitors</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 5</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Price Monitor</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 6</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Settings</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + 7</kbd>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Actions</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Start Scraping</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Stop Scraping</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + Shift + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Start Multi Scraping</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + M</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Export Data</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + E</kbd>
              </div>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Help</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-xs">Ctrl + Shift + ?</kbd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Keyboard shortcuts are disabled when typing in input fields, 
            except for standard text editing shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, etc.).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;