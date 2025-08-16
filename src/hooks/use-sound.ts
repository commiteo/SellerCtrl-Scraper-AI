import { useCallback, useRef } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((soundPath: string, options: SoundOptions = {}) => {
    try {
      // Create new audio element
      const audio = new Audio(soundPath);
      
      // Set options
      audio.volume = options.volume || 0.5;
      audio.loop = options.loop || false;
      
      // Play the sound
      audio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
      
      // Store reference
      audioRef.current = audio;
      
      return audio;
    } catch (error) {
      console.warn('Error playing sound:', error);
      return null;
    }
  }, []);

  const playSuccess = useCallback(() => {
    return playSound('/sounds/success.mp3', { volume: 0.6 });
  }, [playSound]);

  const playError = useCallback(() => {
    return playSound('/sounds/error.mp3', { volume: 0.4 });
  }, [playSound]);

  const playNotification = useCallback(() => {
    return playSound('/sounds/success.mp3', { volume: 0.5 });
  }, [playSound]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    playSound,
    playSuccess,
    playError,
    playNotification,
    stopSound,
  };
}; 