import { useEffect, useRef } from 'react';

export function useAmbientSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        // Initialize on first interaction
        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playAccessPing = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1); 

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    };

    const playTransmissionSound = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        
        // Complex transmission sound composed of multiple oscillators
        const osc1 = audioContextRef.current.createOscillator();
        const osc2 = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        const filter = audioContextRef.current.createBiquadFilter();

        osc1.type = 'square';
        osc1.frequency.setValueAtTime(300, now);
        osc1.frequency.linearRampToValueAtTime(600, now + 0.1);
        osc1.frequency.linearRampToValueAtTime(300, now + 0.2);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(400, now);
        osc2.frequency.linearRampToValueAtTime(800, now + 0.15);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.value = 10;

        gain.gain.setValueAtTime(0.08, now);
        // Stutter effect simulating data transmission
        for (let i = 0; i < 5; i++) {
            const t = now + i * 0.1;
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        }

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    };

    return { playAccessPing, playTransmissionSound };
}
