import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import MatrixBackground from './MatrixBackground';

// Web Audio API for hacker-style pulse effects
const createHackerSound = (audioContext: AudioContext | null) => {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    filter.Q.setValueAtTime(14, now);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(900 + Math.random() * 300, now);
    oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gainNode.gain.setValueAtTime(0.16, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
};

// Ambient hacker pulse for breach phase
const createAmbientPulse = (audioContext: AudioContext | null, frequency: number = 80) => {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency + 40, now);
    filter.Q.setValueAtTime(8, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.35);
};

// Sharp glitch hit for breach completion
const createGlitchHit = (audioContext: AudioContext | null) => {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now);
    osc2.stop(now + 0.06);
};

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0);
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [textSignal, setTextSignal] = useState("");
    const [terminalLines, setTerminalLines] = useState<{ text: string, status: 'busy' | 'ok' }[]>([]);
    const [progress, setProgress] = useState(0);
    const [breachText, setBreachText] = useState("");
    const [glitchIntensity, setGlitchIntensity] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const soundEnabledRef = useRef(true);
    const wordSoundTimeoutsRef = useRef<number[]>([]);

    const clearWordSoundTimeouts = () => {
        wordSoundTimeoutsRef.current.forEach(clearTimeout);
        wordSoundTimeoutsRef.current = [];
    };

    const isWordStart = (text: string, index: number) => {
        if (index < 0 || index >= text.length) return false;
        const char = text[index];
        if (char === ' ' || char === '\n') return false;
        return index === 0 || text[index - 1] === ' ' || text[index - 1] === '\n';
    };

    const scheduleWordSounds = (line: string, interval = 120) => {
        if (!soundEnabledRef.current) return;
        const words = line.split(/\s+/).filter(Boolean);
        words.forEach((_, idx) => {
            const timeout = window.setTimeout(() => createHackerSound(audioContextRef.current), idx * interval);
            wordSoundTimeoutsRef.current.push(timeout);
        });
    };

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

        // Auto-init on first phase
        initAudio();

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const line1 = "I CAN SEE YOU";
    const line2 = "i will find you anywhere and anyhow,\nno matter what you do";
    const signalLine = "SIGNAL_DETECTED";

    useEffect(() => {
        // Phase 0: Shock Intro
        if (phase === 0) {
            const timer = setTimeout(() => setPhase(1), 1800);
            // Play hacker sound when SURPRISE appears
            if (soundEnabledRef.current) {
                createHackerSound(audioContextRef.current);
            }
            return () => {
                clearTimeout(timer);
                clearWordSoundTimeouts();
            };
        }

        // Phase 1: Three-Stage Character reveal
        if (phase === 1) {
            let i = 0;
            const typeLine1 = setInterval(() => {
                setText1(line1.slice(0, i + 1));
                // Play hacker sound for each character
                if (soundEnabledRef.current && isWordStart(line1, i)) {
                    createHackerSound(audioContextRef.current);
                }
                i++;
                if (i >= line1.length) {
                    clearInterval(typeLine1);
                    setTimeout(() => {
                        let j = 0;
                        const typeLine2 = setInterval(() => {
                            setText2(line2.slice(0, j + 1));
                            // Play hacker sound for each character
                            if (soundEnabledRef.current && isWordStart(line2, j)) {
                                createHackerSound(audioContextRef.current);
                            }
                            j++;
                            if (j >= line2.length) {
                                clearInterval(typeLine2);
                                // 1 second buffer before typing SIGNAL_DETECTED
                                setTimeout(() => {
                                    let k = 0;
                                    const typeSignal = setInterval(() => {
                                        setTextSignal(signalLine.slice(0, k + 1));
                                        // Play hacker sound for each character
                                        if (soundEnabledRef.current && isWordStart(signalLine, k)) {
                                            createHackerSound(audioContextRef.current);
                                        }
                                        k++;
                                        if (k >= signalLine.length) {
                                            clearInterval(typeSignal);
                                            // Give final text 1.5s to be read before moving to terminal
                                            setTimeout(() => setPhase(2), 1500);
                                        }
                                    }, 50);
                                }, 1000);
                            }
                        }, 60);
                    }, 500);
                }
            }, 100);
            return () => {
                clearInterval(typeLine1);
                clearWordSoundTimeouts();
            };
        }

        // Phase 2: Terminal sequence
        if (phase === 2) {
            const lines = [
                "Initializing neural link...",
                "Bypassing secure gateway...",
                "Mapping network topology...",
                "Access sequence complete."
            ];

            lines.forEach((line, index) => {
                setTimeout(() => {
                    setTerminalLines(prev => [...prev, { text: line, status: 'busy' }]);
                    // Play hacker-style sound for each word in the terminal line
                    scheduleWordSounds(line, 120);
                    setTimeout(() => {
                        setTerminalLines(prev =>
                            prev.map(l => l.text === line ? { ...l, status: 'ok' } : l)
                        );
                    }, 400);
                }, index * 500);
            });

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }

                    if (soundEnabledRef.current) {
                        createHackerSound(audioContextRef.current);
                    }

                    return prev + 4;
                });
            }, 80);

            const phase2Timer = setTimeout(() => setPhase(2.5), 2500);
            return () => {
                clearInterval(progressInterval);
                clearTimeout(phase2Timer);
                clearWordSoundTimeouts();
            };
        }

        // Phase 2.5: Breach Completion
        if (phase === 2.5) {
            const breachLines = [
                "ACCESS GRANTED",
                "CORE BREACH ESTABLISHED",
                "SYSTEM OVERRIDE"
            ];

            let breachIndex = 0;
            const breakInterval = setInterval(() => {
                if (breachIndex < breachLines.length) {
                    const line = breachLines[breachIndex];
                    setBreachText(line);
                    // Ambient pulse for each breach line
                    createAmbientPulse(audioContextRef.current, 65 + breachIndex * 20);
                    breachIndex++;
                } else {
                    clearInterval(breakInterval);
                }
            }, 800);

            // Glitch intensity animation
            const glitchInterval = setInterval(() => {
                setGlitchIntensity(prev => {
                    if (prev >= 3) {
                        clearInterval(glitchInterval);
                        return 3;
                    }
                    return prev + 1;
                });
            }, 300);

            // Play glitch hit at completion
            setTimeout(() => {
                if (soundEnabledRef.current) {
                    createGlitchHit(audioContextRef.current);
                }
            }, 2000);

            const phase25Timer = setTimeout(() => setPhase(3), 3200);
            return () => {
                clearInterval(breakInterval);
                clearInterval(glitchInterval);
                clearTimeout(phase25Timer);
                clearWordSoundTimeouts();
            };
        }

        // Phase 3: Final Welcome
        if (phase === 3) {
            // Play hacker-style pulse for each word in the welcome message
            scheduleWordSounds("Welcome to Sarif tachamo's Web", 150);
            const finishTimer = setTimeout(onFinish, 1200);
            return () => {
                clearTimeout(finishTimer);
                clearWordSoundTimeouts();
            };
        }
    }, [phase, onFinish]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center font-ops overflow-hidden"
        >
            <div className="absolute inset-0 bg-black -z-20" />
            <MatrixBackground />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
            <div className="absolute inset-0 noise-bg opacity-15 pointer-events-none" />
            <div className="scanlines" />

            <AnimatePresence mode="wait">
                {phase === 0 && (
                    <motion.div
                        key="phase0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 text-center"
                    >
                        <motion.h1
                            className="text-7xl md:text-9xl font-ops font-black text-neon-green tracking-tighter"
                            style={{
                                textShadow: '0 0 20px rgba(0,255,65,1), 0 0 40px rgba(0,255,65,0.5), 0 0 60px rgba(255,255,255,0.3)',
                                letterSpacing: '0.4em',
                                marginLeft: '0.4em' // To offset the extra space on the right for centering
                            }}
                        >
                            SURPRISE
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-1 bg-neon-green mt-4 shadow-[0_0_15px_#00FF41]"
                        />
                    </motion.div>
                )}

                {phase === 1 && (
                    <motion.div
                        key="phase1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center px-6 relative z-10"
                    >
                        {/* Ambient Green Pulse */}
                        <div className="fixed inset-0 green-pulse-bg pointer-events-none -z-10" />

                        <div className="flex flex-col items-center gap-y-6 md:gap-y-10">
                            {/* Line 1 */}
                            <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6">
                                {text1.split("").map((char, i) => (
                                    <motion.span
                                        key={`l1-${i}`}
                                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="text-5xl md:text-8xl font-black text-neon-green tracking-tighter"
                                        style={{ textShadow: '0 0 15px rgba(0,255,65,0.8), 0 0 30px rgba(255,255,255,0.2)' }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </div>

                            {/* Line 2 */}
                            <div className="flex flex-wrap justify-center gap-x-1 md:gap-x-2 min-h-[1em]">
                                {text2.split("").map((char, i) => {
                                    if (char === '\n') {
                                        return <div key={`l2-br-${i}`} className="w-full h-1 md:h-2" />;
                                    }
                                    return (
                                        <motion.span
                                            key={`l2-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            className="text-sm md:text-base font-bold text-neon-green tracking-[0.4em] md:tracking-[0.5em] uppercase animate-pulse"
                                            style={{ textShadow: '0 0 10px rgba(0,255,65,0.4)' }}
                                        >
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-1 md:gap-x-2 mt-12 min-h-[1.5em]">
                            {textSignal.split("").map((char, i) => (
                                <motion.span
                                    key={`sig-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    className="text-base md:text-2xl font-bold text-neon-green tracking-[0.4em] uppercase animate-pulse"
                                    style={{ textShadow: '0 0 15px rgba(0,255,65,0.6)' }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 2 && (
                    <motion.div
                        key="phase2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl px-10 font-mono"
                    >
                        <div className="space-y-4 mb-10">
                            {terminalLines.map((line, i) => (
                                <div key={i} className="flex justify-between items-center text-sm md:text-base">
                                    <div className="flex gap-3 text-neon-green/90">
                                        <span className="text-neon-green font-bold">{'>'}</span>
                                        <span>{line.text}</span>
                                    </div>
                                    <span className={`px-3 py-1 ${line.status === 'ok' ? 'bg-neon-green text-black' : 'bg-neon-green/20 text-neon-green animate-pulse'} font-bold text-[11px] md:text-xs`}>
                                        [{line.status.toUpperCase()}]
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs md:text-sm uppercase tracking-[0.3em] text-neon-green/50">
                                <span>Core_System_Sync</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-neon-green/5 border border-neon-green/10 relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-neon-green via-neon-green/80 to-neon-green shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 2.5 && (
                    <motion.div
                        key="phase25"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
                        className="text-center relative z-10"
                    >
                        {/* Glitch scanlines background */}
                        <div 
                            className="absolute inset-0 pointer-events-none opacity-30"
                            style={{
                                backgroundImage: `repeating-linear-gradient(
                                    0deg,
                                    transparent,
                                    transparent 2px,
                                    rgba(255, 0, 60, 0.15) 2px,
                                    rgba(255, 0, 60, 0.15) 4px
                                )`,
                                animation: `glitch-scan 0.15s infinite`
                            }}
                        />
                        
                        {/* Green scanlines */}
                        <div 
                            className="absolute inset-0 pointer-events-none opacity-20"
                            style={{
                                backgroundImage: `repeating-linear-gradient(
                                    90deg,
                                    transparent,
                                    transparent 3px,
                                    rgba(0, 255, 65, 0.1) 3px,
                                    rgba(0, 255, 65, 0.1) 6px
                                )`
                            }}
                        />

                        <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className="text-5xl md:text-7xl font-black font-ops tracking-wider"
                            style={{
                                textShadow: `
                                    0 0 10px rgba(0,255,65,${0.8 + glitchIntensity * 0.1}),
                                    2px 2px 0 rgba(255,0,60,${glitchIntensity * 0.2}),
                                    -2px -2px 0 rgba(0,255,100,${glitchIntensity * 0.15})
                                `,
                                color: glitchIntensity > 1 ? `hsl(120, 100%, ${50 + glitchIntensity * 5}%)` : '#00FF41'
                            }}
                        >
                            {breachText}
                        </motion.div>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="h-1 bg-neon-green mt-6 shadow-[0_0_15px_rgba(0,255,65,0.8)] origin-left"
                        />

                        {/* Glitch bars */}
                        {glitchIntensity > 0 && (
                            <>
                                <motion.div
                                    animate={{ width: [0, 30, 0] }}
                                    transition={{ duration: 0.4, repeat: Infinity }}
                                    className="h-0.5 bg-neon-red mt-8 ml-auto mr-12"
                                />
                                <motion.div
                                    animate={{ width: [0, 50, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                                    className="h-0.5 bg-neon-cyan mt-4 ml-12"
                                />
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 3 && (

                    <motion.div
                        key="phase3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
                        >
                            <Shield size={500} className="text-neon-green" />
                        </motion.div>

                        <div className="relative">
                            <motion.p
                                initial={{ opacity: 0, letterSpacing: "1em" }}
                                animate={{ opacity: 0.7, letterSpacing: "0.4em" }}
                                transition={{ duration: 1 }}
                                className="text-neon-green text-xl md:text-3xl font-bold uppercase"
                                style={{ textShadow: '0 0 15px rgba(0,255,65,0.6)' }}
                            >
                                Welcome to Sarif tachamo's Web
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
