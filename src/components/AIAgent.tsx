import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Minimize2, MessageSquare } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const TypewriterText = ({ text, delay, onComplete }: { text: string; delay: number; onComplete?: () => void }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, delay);

            return () => clearTimeout(timeout);
        } else {
            onComplete?.();
        }
    }, [currentIndex, delay, text, onComplete]);

    // Ensure parent scrolls as content grows
    useEffect(() => {
        onComplete?.();
    }, [currentText, onComplete]);

    return <span>{currentText}</span>;
};

export default function AIAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'IDENTITY_VERIFIED. I am THE_ORACLE. How can I assist your investigation today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');

        // Add user message to history
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Security-Signal': 'active'
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setIsLoading(false);

            // Add assistant message (typing effect will handle display)
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `ERROR: SIGNAL_INTERRUPTED. ${error.message || 'PLEASE TRY AGAIN.'}`
            }]);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 font-mono">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="w-80 h-[450px] glass-card flex flex-col border-neon-green/40 shadow-[0_0_30px_rgba(0,255,65,0.15)]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-neon-green/10 border-b border-neon-green/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Bot size={20} className="text-neon-green" />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase">THE_ORACLE</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-neon-green/40 hover:text-neon-green transition-colors"
                            >
                                <Minimize2 size={16} />
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[85%] p-3 text-[11px] leading-relaxed
                                        ${msg.role === 'user'
                                            ? 'bg-neon-green text-black font-bold border border-neon-green'
                                            : 'bg-black/40 text-neon-green border border-neon-green/20'}
                                    `}>
                                        {msg.role === 'assistant' ? (
                                            <TypewriterText text={msg.content} delay={10} onComplete={() => {
                                                if (scrollRef.current) {
                                                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                                }
                                            }} />
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-black/40 p-3 border border-neon-green/20 text-[10px] text-neon-green/60 italic flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-neon-green animate-bounce" />
                                            <div className="w-1 h-1 bg-neon-green animate-bounce delay-75" />
                                            <div className="w-1 h-1 bg-neon-green animate-bounce delay-150" />
                                        </div>
                                        DECRYPTING SIGNAL...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-neon-green/20 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Query agent..."
                                className="flex-1 bg-black/40 border border-neon-green/20 px-3 py-2 text-xs text-neon-green outline-none focus:border-neon-green"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-2 bg-neon-green/10 border border-neon-green/40 text-neon-green hover:bg-neon-green hover:text-black transition-all disabled:opacity-30"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-black/80 border-2 border-neon-green text-neon-green flex items-center justify-center shadow-[0_0_20px_#00FF4144] group relative overflow-hidden glass-card"
                    >
                        <div className="absolute inset-0 bg-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageSquare size={24} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-red border-2 border-black rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-red border-2 border-black rounded-full" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
