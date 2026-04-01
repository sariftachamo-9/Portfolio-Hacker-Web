import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import MatrixBackground from './MatrixBackground';

// Web Audio API for keyboard click sounds
const createKeyboardClick = (audioContext: AudioContext | null) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Mechanical click characteristics
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
};

const createKeySound = (audioContext: AudioContext | null) => {
    if (!audioContext) return;
    
    // Secondary click for variation (lower pitch)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.03);
    
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
};

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0);
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [textSignal, setTextSignal] = useState("");
    const [terminalLines, setTerminalLines] = useState<{ text: string, status: 'busy' | 'ok' }[]>([]);
    const [progress, setProgress] = useState(0);
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
            // Play keyboard click when SURPRISE appears
            if (soundEnabledRef.current) {
                createKeyboardClick(audioContextRef.current);
            }
            return () => clearTimeout(timer);
        }

        // Phase 1: Three-Stage Character reveal
        if (phase === 1) {
            let i = 0;
            const typeLine1 = setInterval(() => {
                setText1(line1.slice(0, i + 1));
                // Play keyboard click for each character
                if (soundEnabledRef.current) {
                    createKeyboardClick(audioContextRef.current);
                }
                i++;
                if (i >= line1.length) {
                    clearInterval(typeLine1);
                    setTimeout(() => {
                        let j = 0;
                        const typeLine2 = setInterval(() => {
                            setText2(line2.slice(0, j + 1));
                            // Play keyboard click for each character
                            if (soundEnabledRef.current) {
                                createKeySound(audioContextRef.current);
                            }
                            j++;
                            if (j >= line2.length) {
                                clearInterval(typeLine2);
                                // 1 second buffer before typing SIGNAL_DETECTED
                                setTimeout(() => {
                                    let k = 0;
                                    const typeSignal = setInterval(() => {
                                        setTextSignal(signalLine.slice(0, k + 1));
                                        // Play keyboard click for each character
                                        if (soundEnabledRef.current) {
                                            createKeyboardClick(audioContextRef.current);
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
            return () => clearInterval(typeLine1);
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
                    // Play keyboard click when terminal line appears
                    if (soundEnabledRef.current) {
                        createKeyboardClick(audioContextRef.current);
                    }
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
                    return prev + 4;
                });
            }, 80);

            setTimeout(() => setPhase(3), 2500);
        }

        // Phase 3: Final Welcome
        if (phase === 3) {
            // Play keyboard click when welcome message appears
            if (soundEnabledRef.current) {
                createKeyboardClick(audioContextRef.current);
            }
            setTimeout(onFinish, 1200);
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
