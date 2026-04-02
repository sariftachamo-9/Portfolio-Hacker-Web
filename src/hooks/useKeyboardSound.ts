import { useRef, useEffect, useCallback } from 'react';

interface KeyboardSoundOptions {
  volume?: number;
  clickDecay?: number;
  pitchVariation?: boolean;
}

export function useKeyboardSound(options: KeyboardSoundOptions = {}) {
  const {
    volume = 0.6,
    clickDecay = 0.08,
    pitchVariation = true
  } = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);
  const lastKeyTimeRef = useRef(0);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {
        // Ignore resume failures until a user gesture occurs
      });
    }
  }, []);

  useEffect(() => {
    const startAudio = () => {
      initAudio();
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('pointerdown', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initAudio]);

  // Main mechanical click sound with improved realism
  const createMechanicalClick = useCallback((pitch: number = 800) => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const ctx = audioContextRef.current;
    
    // Create main click oscillator
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    
    // Add a second oscillator for harmonic richness
    const harmonicOsc = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    
    // Create filter for more natural sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.05);
    
    // Main click characteristics
    const startPitch = pitchVariation ? pitch + (Math.random() - 0.5) * 100 : pitch;
    mainOsc.type = 'square';
    mainOsc.frequency.setValueAtTime(startPitch, now);
    mainOsc.frequency.exponentialRampToValueAtTime(startPitch * 0.25, now + clickDecay);
    
    // Harmonic oscillator for depth
    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(startPitch * 1.5, now);
    harmonicOsc.frequency.exponentialRampToValueAtTime(startPitch * 0.3, now + clickDecay * 0.7);
    
    // Volume envelopes (now with higher volume)
    mainGain.gain.setValueAtTime(volume, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + clickDecay);
    
    harmonicGain.gain.setValueAtTime(volume * 0.4, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + clickDecay * 0.6);
    
    // Connect everything
    mainOsc.connect(mainGain);
    harmonicOsc.connect(harmonicGain);
    mainGain.connect(filter);
    harmonicGain.connect(filter);
    filter.connect(ctx.destination);
    
    // Play sounds
    mainOsc.start(now);
    mainOsc.stop(now + clickDecay);
    harmonicOsc.start(now);
    harmonicOsc.stop(now + clickDecay);
  }, [volume, clickDecay, pitchVariation]);

  // Add spring/mechanical release sound for key-up effect
  const createKeyRelease = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const ctx = audioContextRef.current;
    
    // Spring-like release sound
    const releaseOsc = ctx.createOscillator();
    const releaseGain = ctx.createGain();
    
    releaseOsc.type = 'sine';
    releaseOsc.frequency.setValueAtTime(120, now);
    releaseOsc.frequency.exponentialRampToValueAtTime(40, now + 0.03);
    
    releaseGain.gain.setValueAtTime(volume * 0.08, now);
    releaseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    releaseOsc.connect(releaseGain);
    releaseGain.connect(ctx.destination);
    
    releaseOsc.start(now);
    releaseOsc.stop(now + 0.04);
  }, [volume]);

  // Enhanced keyboard click with key-up sound for more realism
  const playKeySound = useCallback(() => {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    
    // Add subtle pitch variation based on typing speed
    const pitchBase = 750;
    let pitch = pitchBase;
    
    if (pitchVariation) {
      // Faster typing = slightly higher pitch for more dynamic feel
      const speedFactor = Math.min(1, Math.max(0.5, 1 - timeSinceLastKey / 200));
      pitch = pitchBase + (Math.random() - 0.5) * 100 + (speedFactor * 50);
    }
    
    createMechanicalClick(pitch);
    
    // Add subtle release sound for non-rapid typing
    if (timeSinceLastKey > 100) {
      setTimeout(() => createKeyRelease(), 5);
    }
    
    lastKeyTimeRef.current = now;
  }, [createMechanicalClick, createKeyRelease, pitchVariation]);

  // Hacker pulse sound for non-button effects
  const playHackerSound = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;

    const now = audioContextRef.current.currentTime;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    filter.Q.setValueAtTime(12, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

    gain.gain.setValueAtTime(volume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }, [volume]);

  // Alternative: Spacebar/Enter heavy key sound
  const playHeavyKeySound = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const ctx = audioContextRef.current;
    
    // Deeper, more pronounced sound for larger keys
    const heavyOsc = ctx.createOscillator();
    const heavyGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    heavyOsc.type = 'triangle';
    heavyOsc.frequency.setValueAtTime(400, now);
    heavyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    
    heavyGain.gain.setValueAtTime(volume * 1.2, now);
    heavyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    heavyOsc.connect(heavyGain);
    heavyGain.connect(filter);
    filter.connect(ctx.destination);
    
    heavyOsc.start(now);
    heavyOsc.stop(now + 0.12);
  }, [volume]);

  // Alternative: Sharp click for modifier keys (Shift, Ctrl, etc.)
  const playSharpKeySound = useCallback(() => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const ctx = audioContextRef.current;
    
    const sharpOsc = ctx.createOscillator();
    const sharpGain = ctx.createGain();
    
    sharpOsc.type = 'square';
    sharpOsc.frequency.setValueAtTime(1200, now);
    sharpOsc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    
    sharpGain.gain.setValueAtTime(volume * 0.6, now);
    sharpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    sharpOsc.connect(sharpGain);
    sharpGain.connect(ctx.destination);
    
    sharpOsc.start(now);
    sharpOsc.stop(now + 0.06);
  }, [volume]);

  // Create a typing pattern sound (e.g., for word completion)
  const createWordTypingSound = useCallback((word: string, speed: number = 80) => {
    if (!soundEnabledRef.current) return;
    
    const chars = word.split('');
    chars.forEach((_, index) => {
      setTimeout(() => {
        playKeySound();
      }, index * speed);
    });
  }, [playKeySound]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    return soundEnabledRef.current;
  }, []);

  // Enable/disable sound
  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  // Set volume dynamically
  const setVolume = useCallback((newVolume: number) => {
    if (audioContextRef.current) {
      // Volume will be applied in subsequent sounds
      // This is a placeholder for dynamic volume control
    }
  }, []);

  return {
    playKeySound,          // Regular key click for buttons
    playHackerSound,       // Hacker-style sound for non-button effects
    playHeavyKeySound,     // Heavy key (Space/Enter)
    playSharpKeySound,     // Sharp click (Modifier keys)
    createWordTypingSound, // Play sound for entire word
    toggleSound,
    setSoundEnabled,
    setVolume,
    isEnabled: () => soundEnabledRef.current
  };
}