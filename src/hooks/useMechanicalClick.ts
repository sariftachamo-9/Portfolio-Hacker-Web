import { useCallback, useRef } from 'react';
import { useKeyboardSound } from './useKeyboardSound';

export function useMechanicalClick() {
  const { playKeySound, playHackerSound, playHeavyKeySound, playSharpKeySound } = useKeyboardSound();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Hacker-style glitch sound
  const createGlitchSound = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Glitchy frequency modulation
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.02);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.08);

    // Filter for cyberpunk effect
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.Q.setValueAtTime(10, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [getAudioContext]);

  // Electric zap sound
  const createZapSound = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }, [getAudioContext]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play mechanical click sound
    playKeySound();
    
    // Add visual feedback
    element.style.transform = 'scale(0.95) translateY(2px)';
    element.style.boxShadow = '0 0 0 2px rgba(0, 255, 65, 0.8), inset 0 2px 4px rgba(0, 0, 0, 0.5)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
    }, 150);
  }, [playKeySound]);

  const handleClickStrong = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play stronger mechanical click sound
    playHeavyKeySound();
    
    // Add stronger visual feedback
    element.style.transform = 'scale(0.92) translateY(3px)';
    element.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 1), inset 0 3px 6px rgba(0, 0, 0, 0.7)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
    }, 200);
  }, [playHeavyKeySound]);

  const handleClickGlitch = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play glitch sound
    createGlitchSound();
    
    // Add glitch visual feedback
    element.style.transform = 'scale(0.93) translateY(2px)';
    element.style.boxShadow = '0 0 0 2px rgba(0, 255, 65, 1), inset 0 2px 4px rgba(0, 0, 0, 0.6)';
    element.style.filter = 'hue-rotate(90deg)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.filter = '';
    }, 200);
  }, [createGlitchSound]);

  const handleClickZap = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play zap sound
    createZapSound();
    
    // Add zap visual feedback
    element.style.transform = 'scale(0.94) translateY(2px)';
    element.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 1), 0 0 20px rgba(0, 255, 65, 0.8)';
    element.style.filter = 'brightness(1.5)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.filter = '';
    }, 150);
  }, [createZapSound]);

  return { handleClick, handleClickStrong, handleClickGlitch, handleClickZap };
}
