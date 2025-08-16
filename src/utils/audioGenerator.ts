// Audio Generator Utility
// Generates simple sounds using Web Audio API when actual sound files are not available

export class AudioGenerator {
  private static audioContext: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private static generateTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    const audioContext = this.getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return { oscillator, gainNode };
  }

  static playSuccessSound() {
    try {
      // Success sound: ascending tones (C5 -> E5 -> G5)
      this.generateTone(523.25, 0.2); // C5
      setTimeout(() => this.generateTone(659.25, 0.2), 200); // E5
      setTimeout(() => this.generateTone(783.99, 0.3), 400); // G5
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  }

  static playErrorSound() {
    try {
      // Error sound: descending tones (G5 -> E5 -> C5)
      this.generateTone(783.99, 0.2); // G5
      setTimeout(() => this.generateTone(659.25, 0.2), 200); // E5
      setTimeout(() => this.generateTone(523.25, 0.3), 400); // C5
    } catch (error) {
      console.warn('Failed to play error sound:', error);
    }
  }

  static playNotificationSound() {
    try {
      // Notification sound: two short beeps
      this.generateTone(800, 0.1);
      setTimeout(() => this.generateTone(800, 0.1), 150);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  static playCustomSound(frequencies: number[], durations: number[] = []) {
    try {
      frequencies.forEach((freq, index) => {
        const duration = durations[index] || 0.2;
        setTimeout(() => this.generateTone(freq, duration), index * 200);
      });
    } catch (error) {
      console.warn('Failed to play custom sound:', error);
    }
  }
} 