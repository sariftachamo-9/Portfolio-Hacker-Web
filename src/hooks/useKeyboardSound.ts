import { useRef, useEffect, useCallback } from 'react';

export function useKeyboardSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    // Auto-init on mount
    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Mechanical click sound (primary)
  const createKeyboardClick = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    // Mechanical click characteristics
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.08);
  }, []);

  // Secondary click sound (variation)
  const createKeySound = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContextRef.current.currentTime + 0.03);
    
    gainNode.gain.setValueAtTime(0.08, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.05);
  }, []);

  // Play random click sound (alternates between primary and secondary)
  const playKeySound = useCallback(() => {
    if (Math.random() > 0.5) {
      createKeyboardClick();
    } else {
      createKeySound();
    }
  }, [createKeyboardClick, createKeySound]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    return soundEnabledRef.current;
  }, []);

  // Enable/disable sound
  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  return {
    playKeySound,
    createKeyboardClick,
    createKeySound,
    toggleSound,
    setSoundEnabled,
    isEnabled: () => soundEnabledRef.current
  };
}
