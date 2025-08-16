import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AudioGenerator } from '@/utils/audioGenerator';

interface SoundSettings {
  enableSounds: boolean;
  soundVolume: number;
}

interface SoundContextType {
  settings: SoundSettings;
  updateSettings: (newSettings: Partial<SoundSettings>) => void;
  playSuccess: () => void;
  playError: () => void;
  playNotification: () => void;
}

const defaultSettings: SoundSettings = {
  enableSounds: true,
  soundVolume: 0.6,
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSoundSettings = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundSettings must be used within a SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    // Load settings from localStorage on initialization
    const saved = localStorage.getItem('soundSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soundSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<SoundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const playSound = async (soundPath: string) => {
    if (!settings.enableSounds) return;

    try {
      // Try to play the audio file first
      const audio = new Audio(soundPath);
      audio.volume = settings.soundVolume;
      
      // Check if the audio file exists and can be loaded
      const canPlay = await new Promise<boolean>((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audio.addEventListener('error', () => resolve(false), { once: true });
        audio.load();
        
        // Timeout after 1 second
        setTimeout(() => resolve(false), 1000);
      });

      if (canPlay) {
        await audio.play();
      } else {
        // Fallback to generated sound
        console.log('Audio file not found, using generated sound');
        if (soundPath.includes('success')) {
          AudioGenerator.playSuccessSound();
        } else if (soundPath.includes('error')) {
          AudioGenerator.playErrorSound();
        } else {
          AudioGenerator.playNotificationSound();
        }
      }
    } catch (error) {
      console.warn('Error playing sound file, using generated sound:', error);
      // Fallback to generated sound
      if (soundPath.includes('success')) {
        AudioGenerator.playSuccessSound();
      } else if (soundPath.includes('error')) {
        AudioGenerator.playErrorSound();
      } else {
        AudioGenerator.playNotificationSound();
      }
    }
  };

  const playSuccess = () => {
    if (!settings.enableSounds) return;
    playSound('/sounds/success.mp3');
  };

  const playError = () => {
    if (!settings.enableSounds) return;
    playSound('/sounds/error.mp3');
  };

  const playNotification = () => {
    if (!settings.enableSounds) return;
    playSound('/sounds/success.mp3');
  };

  const value: SoundContextType = {
    settings,
    updateSettings,
    playSuccess,
    playError,
    playNotification,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}; 