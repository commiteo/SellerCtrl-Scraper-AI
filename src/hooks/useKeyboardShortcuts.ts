/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts functionality
 */

import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Go to Home',
      category: 'Navigation'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => navigate('/scraper'),
      description: 'Go to Scraper',
      category: 'Navigation'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => navigate('/noon-scraper'),
      description: 'Go to Noon Scraper',
      category: 'Navigation'
    },
    {
      key: '4',
      ctrlKey: true,
      action: () => navigate('/history'),
      description: 'Go to History',
      category: 'Navigation'
    },
    {
      key: '5',
      ctrlKey: true,
      action: () => navigate('/competitors'),
      description: 'Go to Competitors',
      category: 'Navigation'
    },
    {
      key: '6',
      ctrlKey: true,
      action: () => navigate('/price-monitor'),
      description: 'Go to Price Monitor',
      category: 'Navigation'
    },
    {
      key: '7',
      ctrlKey: true,
      action: () => navigate('/settings'),
      description: 'Go to Settings',
      category: 'Navigation'
    },
    // Action shortcuts
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        const startButton = document.querySelector('[data-testid="start-scrape"]') as HTMLButtonElement;
        if (startButton && !startButton.disabled) {
          startButton.click();
        }
      },
      description: 'Start Scraping',
      category: 'Actions'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        const exportButton = document.querySelector('[data-testid="export-csv"]') as HTMLButtonElement;
        const exportDataButton = document.querySelector('[data-testid="export-data"]') as HTMLButtonElement;
        if (exportButton && !exportButton.disabled) {
          exportButton.click();
        } else if (exportDataButton && !exportDataButton.disabled) {
          exportDataButton.click();
        }
      },
      description: 'Export Data',
      category: 'Actions'
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        const stopButton = document.querySelector('[data-testid="stop-scraping"]') as HTMLButtonElement;
        const stopMultiButton = document.querySelector('[data-testid="stop-multi-scraping"]') as HTMLButtonElement;
        if (stopButton && !stopButton.disabled) {
          stopButton.click();
        } else if (stopMultiButton && !stopMultiButton.disabled) {
          stopMultiButton.click();
        }
      },
      description: 'Stop Scraping',
      category: 'Actions'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => {
        const multiScrapingButton = document.querySelector('[data-testid="start-multi-scraping"]') as HTMLButtonElement;
        if (multiScrapingButton && !multiScrapingButton.disabled) {
          multiScrapingButton.click();
        }
      },
      description: 'Start Multi Scraping',
      category: 'Actions'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        // Refresh current page data
        window.location.reload();
      },
      description: 'Refresh Page',
      category: 'Actions'
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Focus on search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="بحث" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focus Search',
      category: 'Actions'
    },
    // Help shortcut
    {
      key: '?',
      shiftKey: true,
      action: () => showShortcutsHelp(),
      description: 'Show Keyboard Shortcuts',
      category: 'Help'
    },
    {
      key: 'F1',
      action: () => showShortcutsHelp(),
      description: 'Show Keyboard Shortcuts',
      category: 'Help'
    }
  ];

  const showShortcutsHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z in inputs
      const allowedInInputs = ['a', 'c', 'v', 'x', 'z'];
      if (event.ctrlKey && allowedInInputs.includes(event.key.toLowerCase())) {
        return;
      }
      // Don't process other shortcuts in input fields
      if (event.key !== 'F1' && !(event.shiftKey && event.key === '?')) {
        return;
      }
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
    showShortcutsHelp,
    showHelp,
    setShowHelp
  };
};

export default useKeyboardShortcuts;