import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Unlock, Key, RefreshCw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MatrixBackground from '../components/MatrixBackground';

export default function Cryptography() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [keys, setKeys] = useState<{ public: string; private: string } | null>(null);
    const [plaintext, setPlaintext] = useState('');
    const [ciphertext, setCiphertext] = useState('');
    const [decrypted, setDecrypted] = useState('');

    const generateKeys = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setKeys({
                public: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...[SECURE_PUB_KEY]',
                private: '-----BEGIN RSA PRIVATE KEY-----...[ENCRYPTED_VAULT]',
            });
            setIsGenerating(false);
            setStep(2);
        }, 2000);
    };

    const encrypt = () => {
        if (!plaintext) return;
        // Simulated encryption
        setCiphertext(btoa(plaintext).split('').reverse().join(''));
        setStep(3);
    };

    const decrypt = () => {
        if (!ciphertext) return;
        // Simulated decryption
        setDecrypted(atob(ciphertext.split('').reverse().join('')));
        setStep(4);
    };

    return (
        <div className="min-h-screen bg-black text-neon-green font-mono relative overflow-hidden">
            <MatrixBackground />
            <div className="scanlines" />

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                <Link to="/" className="flex items-center gap-2 text-xs hover:text-white transition-all group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> [ RETURN_TO_CORE ]
                </Link>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Shield className="mx-auto mb-6 text-neon-green/80" size={48} />
                    <h1 className="text-4xl md:text-6xl font-bold glitch mb-4">CRYPTO_LAB</h1>
                    <p className="text-neon-green/50 text-xs uppercase tracking-widest italic">
            // INTERACTIVE ASYMMETRIC ENCRYPTION SIMULATOR
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    {/* Step 1: Key Generation */}
                    <section className={`glass-card p-8 border-neon-green/20 ${step === 1 ? 'neon-glow' : 'opacity-50'}`}>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                            <span className="text-neon-green/20">01.</span> KEY_GENERATION
                        </h2>
                        <p className="text-xs text-neon-green/60 mb-8 leading-relaxed">
                            Asymmetric cryptography uses a pair of keys: a public key for encryption and a private key for decryption.
                        </p>
                        {!keys ? (
                            <button
                                onClick={generateKeys}
                                disabled={isGenerating}
                                className="w-full py-4 bg-neon-green/10 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all font-bold flex items-center justify-center gap-3"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <Key size={20} />
                                )}
                                {isGenerating ? '[ GENERATING_KEYS... ]' : '[ INITIALIZE_KEY_PAIR ]'}
                            </button>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-black/60 border border-neon-green/10">
                                    <div className="text-[10px] uppercase text-neon-green/40 mb-2">Public_Key</div>
                                    <div className="text-[8px] break-all text-neon-green/80">{keys.public}</div>
                                </div>
                                <div className="p-4 bg-black/60 border border-neon-green/10">
                                    <div className="text-[10px] uppercase text-neon-green/40 mb-2">Private_Key</div>
                                    <div className="text-[8px] break-all text-neon-red/50 uppercase">[ ENCRYPTED_STORAGE ]</div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Step 2: Encryption */}
                    <section className={`glass-card p-8 border-neon-green/20 ${step === 2 ? 'neon-glow' : step < 2 ? 'opacity-30' : 'opacity-50'}`}>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                            <span className="text-neon-green/20">02.</span> ENCRYPTION_PHASE
                        </h2>
                        <div className="space-y-4">
                            <textarea
                                placeholder="Enter sensitive payload for encryption..."
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                disabled={step < 2}
                                className="w-full bg-black/40 border border-neon-green/20 p-4 font-mono text-sm text-neon-green placeholder:text-neon-green/10 focus:border-neon-green outline-none h-24"
                            />
                            <button
                                onClick={encrypt}
                                disabled={step < 2 || !plaintext}
                                className="w-full py-3 border border-neon-green/50 text-neon-green hover:bg-neon-green hover:text-black disabled:border-white/10 disabled:text-white/10 transition-all font-bold flex items-center justify-center gap-3"
                            >
                                <Lock size={18} /> [ EXECUTE_RSA_ENCRYPTION ]
                            </button>
                        </div>
                        {ciphertext && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 p-4 bg-neon-green/5 border border-neon-green/10"
                            >
                                <div className="text-[10px] uppercase text-neon-green/40 mb-2">Ciphertext_Result</div>
                                <div className="text-xs break-all text-neon-green font-bold">{ciphertext}</div>
                            </motion.div>
                        )}
                    </section>

                    {/* Step 3: Decryption */}
                    <section className={`glass-card p-8 border-neon-green/20 ${step === 3 ? 'neon-glow' : step < 3 ? 'opacity-30' : 'opacity-100'}`}>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                            <span className="text-neon-green/20">03.</span> DECRYPTION_PHASE
                        </h2>
                        <button
                            onClick={decrypt}
                            disabled={step < 3}
                            className="w-full py-4 bg-neon-red/10 border border-neon-red/50 text-neon-red hover:bg-neon-red hover:text-white disabled:border-white/10 disabled:text-white/10 transition-all font-bold flex items-center justify-center gap-3"
                        >
                            <Unlock size={20} /> [ BREACH_CIPHERTEXT ]
                        </button>
                        {decrypted && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mt-6 p-6 border-2 border-neon-green shadow-[0_0_20px_rgba(0,255,65,0.2)]"
                            >
                                <div className="text-[10px] uppercase text-neon-green/40 mb-2">Decrypted_Original_Payload</div>
                                <div className="text-xl text-white font-bold">{decrypted}</div>
                            </motion.div>
                        )}
                    </section>
                </div>

                <div className="mt-16 text-center text-neon-green/20 text-[10px] uppercase tracking-[0.3em]">
                    SECURITY_MODE: ACTIVE // RSA_LEVEL: 4096_BIT
                </div>
            </div>
        </div>
    );
}
