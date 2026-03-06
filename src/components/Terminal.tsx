import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalLine {
    type: 'input' | 'output' | 'error' | 'success';
    content: string;
}

export default function Terminal() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: 'output', content: 'SYSTEM INITIALIZED. WECOME TO THE SECURE ACCESS LAYER.' },
        { type: 'output', content: 'Type "help" to see available commands.' },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const cleanCmd = cmd.toLowerCase().trim();
        let response: TerminalLine[] = [];

        switch (cleanCmd) {
            case 'help':
                response = [
                    { type: 'output', content: 'AVAILABLE COMMANDS:' },
                    { type: 'output', content: ' - whoami: Display user identity' },
                    { type: 'output', content: ' - ls projects: List all secure projects' },
                    { type: 'output', content: ' - cat [project]: View project details' },
                    { type: 'output', content: ' - clear: Wipe terminal history' },
                    { type: 'output', content: ' - hack: [ DEEP_TRACE ]' },
                ];
                break;
            case 'whoami':
                response = [{ type: 'output', content: 'ANONYMOUS_USER@SEC_CORE:~/ACCESS_LEVEL_0' }];
                break;
            case 'ls projects':
                response = [
                    { type: 'output', content: 'SECURE_STORAGE/PROJECTS:' },
                    { type: 'output', content: ' > asymmetric-crypto-platform' },
                    { type: 'output', content: ' > cybersecurity-learning-suite' },
                    { type: 'output', content: ' > employee-management-system' },
                ];
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'hack':
                response = [
                    { type: 'error', content: 'ERROR: UNAUTHORIZED ACCESS DETECTED.' },
                    { type: 'error', content: 'LOCAL SECURITY NODE ALERTED.' },
                    { type: 'error', content: 'INITIATING TRACEBACK...' },
                ];
                break;
            default:
                response = [{ type: 'error', content: `COMMAND NOT FOUND: ${cleanCmd}` }];
        }

        setHistory([...history, { type: 'input', content: `> ${cmd}` }, ...response]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            handleCommand(input);
            setInput('');
        }
    };

    return (
        <div
            className="w-full max-w-4xl mx-auto h-[400px] bg-black/80 border border-neon-green/30 font-mono text-sm relative overflow-hidden glass-card crt-flicker"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Terminal Header */}
            <div className="bg-neon-green/10 border-b border-neon-green/20 px-4 py-1 flex justify-between items-center">
                <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neon-red/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-neon-green/50" />
                </div>
                <div className="text-[10px] text-neon-green/50 uppercase tracking-widest">Secure Terminal v2.0.4</div>
            </div>

            {/* Terminal Content */}
            <div
                ref={scrollRef}
                className="p-4 h-[330px] overflow-y-auto scrollbar-hide space-y-1"
            >
                <AnimatePresence>
                    {history.map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`
                ${line.type === 'input' ? 'text-white' : ''}
                ${line.type === 'error' ? 'text-neon-red' : ''}
                ${line.type === 'success' ? 'text-neon-green' : 'text-neon-green/80'}
              `}
                        >
                            {line.content}
                        </motion.div>
                    ))}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex">
                    <span className="text-neon-green mr-2">{'>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-neon-green p-0 focus:ring-0"
                        autoFocus
                    />
                </form>
            </div>

            {/* Scanline overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        </div>
    );
}
