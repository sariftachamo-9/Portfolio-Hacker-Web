import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKeyboardSound } from '../hooks/useKeyboardSound';

interface TerminalLine {
    type: 'input' | 'output' | 'error' | 'success' | 'warn' | 'progress' | 'system';
    content: string;
}

const FAKE_IPS = ['43.21.8.112', '192.168.1.55', '10.0.0.23', '172.16.4.88', '8.8.8.8', '1.1.1.1', '185.220.101.x'];
const FAKE_HASHES = [
    'root:$6$rBXqNi4L$8kX:0:0:root:/root:/bin/bash',
    'daemon:*:17737:0:99999:7:::',
    'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
    'sarif:$6$Kp9.salt$Hd7y3mL:1000:1000:Sarif,,,:/home/sarif:/bin/bash',
    'postgres:x:109:117:PostgreSQL,,,:/var/lib/postgresql:/bin/bash',
];
const PORTS = [
    { port: 22, service: 'ssh', state: 'open' },
    { port: 80, service: 'http', state: 'open' },
    { port: 443, service: 'https', state: 'open' },
    { port: 3306, service: 'mysql', state: 'filtered' },
    { port: 5432, service: 'postgresql', state: 'open' },
    { port: 8080, service: 'http-proxy', state: 'closed' },
];

function animateLines(
    lines: TerminalLine[],
    setter: React.Dispatch<React.SetStateAction<TerminalLine[]>>,
    baseDelay = 0
) {
    lines.forEach((line, i) => {
        setTimeout(() => {
            setter(prev => [...prev, line]);
        }, baseDelay + i * 180);
    });
}

export default function Terminal() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: 'system', content: '╔══════════════════════════════════════════════════╗' },
        { type: 'system', content: '║     SECURE_SHELL v2.0.4 — SARIF_SEC CORE NET     ║' },
        { type: 'system', content: '╚══════════════════════════════════════════════════╝' },
        { type: 'output', content: 'Type "help" for available commands.' },
    ]);
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [redAlert, setRedAlert] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { playHackerSound } = useKeyboardSound();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const addLines = (lines: TerminalLine[], delay = 0) => {
        lines.forEach((line, i) => {
            setTimeout(() => {
                setHistory(prev => [...prev, line]);
            }, delay + i * 180);
        });
        return delay + lines.length * 180;
    };

    const addProgressBar = (label: string, afterDelay: number, onDone?: () => void) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8 + 4);
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setHistory(prev => {
                    const updated = [...prev];
                    let idx = -1;
                    for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].content.startsWith(label)) { idx = i; break; }
                    }
                    if (idx !== -1) updated[idx] = { type: 'progress', content: `${label} [${'█'.repeat(20)}] 100%` };
                    return updated;
                });
                onDone?.();
            } else {
                const filled = Math.floor(progress / 5);
                const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
                setHistory(prev => {
                    const updated = [...prev];
                    let idx = -1;
                    for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].content.startsWith(label)) { idx = i; break; }
                    }
                    if (idx !== -1) {
                        updated[idx] = { type: 'progress', content: `${label} [${bar}] ${progress}%` };
                    } else {
                        return [...prev, { type: 'progress', content: `${label} [${bar}] ${progress}%` }];
                    }
                    return updated;
                });
            }
        }, 60);
    };

    const handleCommand = (cmd: string) => {
        const clean = cmd.toLowerCase().trim();
        const inputLine: TerminalLine = { type: 'input', content: `root@sarif-sec:~# ${cmd}` };
        setHistory(prev => [...prev, inputLine]);

        if (clean === 'clear') { setHistory([]); return; }

        setIsProcessing(true);
        let endTime = 0;

        switch (true) {
            case clean === 'help':
                endTime = addLines([
                    { type: 'output', content: '┌─ AVAILABLE_COMMANDS ──────────────────────────────┐' },
                    { type: 'output', content: '│  whoami / whoami --verbose  — Operator identity    │' },
                    { type: 'output', content: '│  ls projects                — List programs         │' },
                    { type: 'output', content: '│  nmap -sV <target>          — Network scan          │' },
                    { type: 'output', content: '│  crack --wordlist rockyou   — Hash cracker          │' },
                    { type: 'output', content: '│  trace --ip <ip>            — IP traceroute         │' },
                    { type: 'output', content: '│  decrypt --key rsa4096      — Decrypt payload       │' },
                    { type: 'output', content: '│  ssh root@192.168.1.1       — Remote shell          │' },
                    { type: 'output', content: '│  cat /etc/shadow            — Shadow file dump      │' },
                    { type: 'output', content: '│  cat /etc/passwd            — User list dump        │' },
                    { type: 'output', content: '│  netstat -an                — Active connections    │' },
                    { type: 'output', content: '│  ifconfig                   — Network interfaces    │' },
                    { type: 'output', content: '│  ping --flood 10.0.0.1      — ICMP flood ping       │' },
                    { type: 'output', content: '│  exploit --target apache2   — CVE exploit probe     │' },
                    { type: 'output', content: '│  matrix                     — [ ??? ]               │' },
                    { type: 'output', content: '│  exit                       — Terminate session     │' },
                    { type: 'output', content: '│  clear                      — Wipe terminal         │' },
                    { type: 'output', content: '└───────────────────────────────────────────────────┘' },
                ]);
                break;

            case clean === 'whoami':
                endTime = addLines([
                    { type: 'success', content: 'ANONYMOUS_USER@SEC_CORE:~/ACCESS_LEVEL_0' },
                ]);
                break;

            case clean === 'whoami --verbose':
                endTime = addLines([
                    { type: 'system', content: '┌─ OPERATOR_DOSSIER ──────────────────────────────────┐' },
                    { type: 'success', content: '│  CALLSIGN:    SARIF TACHAMO                         │' },
                    { type: 'success', content: '│  CLEARANCE:   ALPHA-7 [TOP_SECRET]                  │' },
                    { type: 'success', content: '│  ROLE:        CYBERSECURITY_EXPERT                  │' },
                    { type: 'success', content: '│  LOCATION:    BHAKTAPUR, NEPAL [27.67N, 85.43E]     │' },
                    { type: 'success', content: '│  STATUS:      ◉ ONLINE | ACTIVE                     │' },
                    { type: 'success', content: '│  THREAT_LVL:  ████████░░ OPERATOR                   │' },
                    { type: 'success', content: '│  SKILLS:      PENTEST | CRYPTO | AI/ML | WEBDEV      │' },
                    { type: 'system', content: '└─────────────────────────────────────────────────────┘' },
                ]);
                break;

            case /^nmap/.test(clean):
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: `Starting Nmap 7.94 ( https://nmap.org )` },
                        { type: 'output', content: `Scanning 192.168.1.0/24 [256 hosts up]...` },
                    ]);
                    setTimeout(() => {
                        addProgressBar('SCANNING', 0, () => {
                            setTimeout(() => {
                                addLines([
                                    { type: 'output', content: '─────────────────────────────────────────────' },
                                    { type: 'output', content: 'PORT      STATE     SERVICE    VERSION' },
                                    ...PORTS.map(p => ({
                                        type: (p.state === 'open' ? 'success' : p.state === 'filtered' ? 'warn' : 'error') as TerminalLine['type'],
                                        content: `${String(p.port).padEnd(9)} ${p.state.padEnd(9)} ${p.service.padEnd(10)} OpenSSH 8.9`,
                                    })),
                                    { type: 'output', content: '─────────────────────────────────────────────' },
                                    { type: 'success', content: `Nmap done: 256 IP addresses (${Math.floor(Math.random() * 12 + 4)} hosts up)` },
                                ]);
                            }, 300);
                        });
                    }, 400);
                }, 0);
                endTime = 5000;
                break;

            case /^crack/.test(clean):
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: 'Using wordlist: rockyou.txt (14,344,392 words)' },
                        { type: 'output', content: 'Hash type: MD5 detected' },
                        { type: 'warn', content: 'Target: 5f4dcc3b5aa765d61d8327deb882cf99' },
                    ]);
                    setTimeout(() => {
                        addProgressBar('CRACKING', 0, () => {
                            setTimeout(() => {
                                addLines([
                                    { type: 'success', content: '╔═══════════════════════════════════════╗' },
                                    { type: 'success', content: '║  PASSWORD CRACKED: ████████           ║' },
                                    { type: 'success', content: '║  Hash  → 5f4dcc3b5aa765d61d8327...   ║' },
                                    { type: 'success', content: '║  Plain → [REDACTED FOR DEMO]          ║' },
                                    { type: 'success', content: '╚═══════════════════════════════════════╝' },
                                ]);
                            }, 300);
                        });
                    }, 400);
                }, 0);
                endTime = 5000;
                break;

            case /^trace/.test(clean): {
                const targetIp = cmd.split(' ').pop() || '8.8.8.8';
                const hops = [
                    { hop: 1, ip: '192.168.1.1', ms: 1, host: 'gateway.local' },
                    { hop: 2, ip: '10.20.0.1', ms: 8, host: 'isp-node-01' },
                    { hop: 3, ip: '103.48.29.2', ms: 22, host: 'backbone-01.np' },
                    { hop: 4, ip: '210.5.197.1', ms: 58, host: 'sg-edge-01' },
                    { hop: 5, ip: '72.14.202.68', ms: 140, host: 'google-peer' },
                    { hop: 6, ip: targetIp, ms: 185, host: 'target.google.com' },
                ];
                setTimeout(() => {
                    addLines([{ type: 'output', content: `traceroute to ${targetIp} — max 30 hops` }]);
                    hops.forEach((h, i) => {
                        setTimeout(() => {
                            setHistory(prev => [...prev, {
                                type: i === hops.length - 1 ? 'success' : 'output',
                                content: ` ${String(h.hop).padStart(2)}  ${h.ip.padEnd(18)} ${h.ms}ms  [${h.host}]`
                            }]);
                        }, i * 500);
                    });
                }, 0);
                endTime = hops.length * 500 + 500;
                break;
            }

            case /^decrypt/.test(clean):
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: 'Initializing RSA-4096 decryption engine...' },
                        { type: 'output', content: 'Loading private key from keychain...' },
                        { type: 'warn', content: 'Encrypted payload: 2048 bytes detected' },
                    ]);
                    setTimeout(() => {
                        addProgressBar('DECRYPTING', 0, () => {
                            setTimeout(() => {
                                addLines([
                                    { type: 'success', content: '✓ PAYLOAD DECRYPTED SUCCESSFULLY' },
                                    { type: 'output', content: '─────────────────────────────────────────────' },
                                    { type: 'output', content: '{ "user": "sarif", "clearance": "ALPHA-7",' },
                                    { type: 'output', content: '  "access": "GRANTED", "ts": "' + new Date().toISOString() + '" }' },
                                    { type: 'output', content: '─────────────────────────────────────────────' },
                                ]);
                            }, 300);
                        });
                    }, 600);
                }, 0);
                endTime = 5000;
                break;

            case /^ssh/.test(clean): {
                const sshTarget = cmd.split(' ').pop() || 'root@192.168.1.1';
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: `Connecting to ${sshTarget}...` },
                        { type: 'output', content: 'Establishing encrypted tunnel...' },
                        { type: 'output', content: 'Host key fingerprint: SHA256:xJ9kLm...' },
                    ]);
                    setTimeout(() => {
                        addLines([
                            { type: 'success', content: '┌────────────────────────────────────────┐' },
                            { type: 'success', content: '│  CONNECTION ESTABLISHED                │' },
                            { type: 'success', content: `│  Welcome, OPERATOR. [${sshTarget}]` + ' '.repeat(Math.max(0, 20 - sshTarget.length)) + '│' },
                            { type: 'success', content: '│  Last login: ' + new Date().toLocaleString() + '│' },
                            { type: 'success', content: '└────────────────────────────────────────┘' },
                        ]);
                    }, 1800);
                }, 0);
                endTime = 3000;
                break;
            }

            case clean === 'cat /etc/shadow':
                setTimeout(() => {
                    addLines([
                        { type: 'warn', content: '[WARN] Reading system shadow file...' },
                        { type: 'output', content: '─────────────────────────────────────────────' },
                        ...FAKE_HASHES.map(h => ({ type: 'error' as TerminalLine['type'], content: h })),
                        { type: 'output', content: '─────────────────────────────────────────────' },
                        { type: 'warn', content: `${FAKE_HASHES.length} entries read.` },
                    ]);
                }, 0);
                endTime = FAKE_HASHES.length * 180 + 600;
                break;

            case clean === 'cat /etc/passwd':
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: 'root:x:0:0:root:/root:/bin/bash' },
                        { type: 'output', content: 'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin' },
                        { type: 'output', content: 'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin' },
                        { type: 'success', content: 'sarif:x:1000:1000:Sarif Tachamo:/home/sarif:/bin/bash' },
                        { type: 'output', content: 'postgres:x:109:117:PostgreSQL,,,:/var/lib/postgresql:/bin/bash' },
                    ]);
                }, 0);
                endTime = 5 * 180 + 200;
                break;

            case clean === 'netstat -an':
                setTimeout(() => {
                    addLines([
                        { type: 'output', content: 'Proto  Local Address        Foreign Address      State' },
                        { type: 'output', content: '────────────────────────────────────────────────────' },
                        { type: 'success', content: 'tcp    0.0.0.0:443          0.0.0.0:*            LISTEN' },
                        { type: 'success', content: 'tcp    0.0.0.0:22           0.0.0.0:*            LISTEN' },
                        { type: 'success', content: `tcp    127.0.0.1:5432        0.0.0.0:*            LISTEN` },
                        { type: 'warn', content: `tcp    192.168.1.5:4444       ${FAKE_IPS[0]}:8080   ESTABLISHED` },
                        { type: 'output', content: `tcp    192.168.1.5:22        ${FAKE_IPS[1]}:49120   ESTABLISHED` },
                    ]);
                }, 0);
                endTime = 7 * 180 + 200;
                break;

            case clean === 'ifconfig':
                setTimeout(() => {
                    addLines([
                        { type: 'success', content: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>' },
                        { type: 'output', content: '        inet 192.168.1.5  netmask 255.255.255.0  broadcast 192.168.1.255' },
                        { type: 'output', content: '        ether 08:00:27:4a:9b:2c  txqueuelen 1000' },
                        { type: 'output', content: '        RX packets 184291 bytes 211MB  TX packets 97820 bytes 88MB' },
                        { type: 'success', content: 'lo: flags=73<UP,LOOPBACK,RUNNING>' },
                        { type: 'output', content: '        inet 127.0.0.1  netmask 255.0.0.0' },
                        { type: 'output', content: '        loop  txqueuelen 1000  RX/TX packets 8821' },
                    ]);
                }, 0);
                endTime = 7 * 180 + 200;
                break;

            case /^ping/.test(clean): {
                const pingTarget = cmd.split(' ').pop() || '10.0.0.1';
                let pingCount = 0;
                const pings: TerminalLine[] = [{ type: 'output', content: `PING ${pingTarget}: 56 data bytes` }];
                for (let i = 0; i < 6; i++) {
                    pings.push({ type: 'success', content: `64 bytes from ${pingTarget}: icmp_seq=${i} ttl=64 time=${(Math.random() * 4 + 1).toFixed(1)} ms` });
                }
                pings.push({ type: 'output', content: `─── ${pingTarget} ping statistics ───` });
                pings.push({ type: 'success', content: '6 packets transmitted, 6 received, 0% packet loss' });
                addLines(pings, 0);
                endTime = pings.length * 180 + 200;
                break;
            }

            case /^exploit/.test(clean):
                setTimeout(() => {
                    addLines([
                        { type: 'warn', content: 'Probing target: apache2 httpd 2.4.49...' },
                        { type: 'output', content: 'Checking CVE database...' },
                        { type: 'error', content: '[CVE-2021-41773] Path Traversal — SEVERITY: CRITICAL' },
                        { type: 'error', content: '[CVE-2021-42013] RCE via mod_cgi — SEVERITY: HIGH' },
                        { type: 'warn', content: 'Attempting exploit chain...' },
                    ]);
                    setTimeout(() => {
                        addProgressBar('EXPLOITING', 0, () => {
                            setTimeout(() => {
                                addLines([
                                    { type: 'success', content: '✓ SHELL OBTAINED — www-data@victim:/var/www/html$' },
                                    { type: 'warn', content: '// NOTE: This is a simulated demo. Ethical use only.' },
                                ]);
                            }, 300);
                        });
                    }, 1200);
                }, 0);
                endTime = 6000;
                break;

            case clean === 'matrix':
                setTimeout(() => {
                    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ@#$%';
                    for (let i = 0; i < 20; i++) {
                        const line = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join(' ');
                        setHistory(prev => [...prev, { type: 'success', content: line }]);
                    }
                    setTimeout(() => {
                        setHistory(prev => [...prev, { type: 'system', content: '[ MATRIX MODE DISENGAGED ]' }]);
                    }, 2000);
                }, 0);
                endTime = 2500;
                break;

            case clean === 'exit':
                setTimeout(() => {
                    addLines([
                        { type: 'warn', content: 'Wiping session trace...' },
                        { type: 'warn', content: 'Clearing audit logs...' },
                        { type: 'error', content: 'SESSION TERMINATED. TRACE WIPED. GOODBYE, OPERATOR.' },
                    ]);
                    setTimeout(() => setHistory([
                        { type: 'system', content: 'SECURE_SHELL v2.0.4 — SESSION RESTARTED' },
                        { type: 'output', content: 'Type "help" for available commands.' },
                    ]), 2500);
                }, 0);
                endTime = 3000;
                break;

            case clean === 'ls projects':
                endTime = addLines([
                    { type: 'output', content: 'SECURE_STORAGE/PROJECTS:' },
                    { type: 'success', content: ' ❯ asymmetric-crypto-platform     [PROD]' },
                    { type: 'success', content: ' ❯ cybersecurity-learning-suite    [PROD]' },
                    { type: 'success', content: ' ❯ employee-management-system      [PROD]' },
                    { type: 'success', content: ' ❯ stego-surveillance-framework    [RESEARCH]' },
                    { type: 'warn', content: ' ❯ [CLASSIFIED_PROJECT_X]           [SECRET]' },
                ]);
                break;

            case clean === 'sudo rm -rf /':
                setRedAlert(true);
                setTimeout(() => setRedAlert(false), 2000);
                setTimeout(() => {
                    addLines([
                        { type: 'error', content: '[!!] WARNING: DESTRUCTIVE COMMAND DETECTED' },
                        { type: 'error', content: '[!!] SANDBOXED — YOU CANNOT HARM THIS SYSTEM.' },
                        { type: 'error', content: '[!!] YOUR IP HAS BEEN LOGGED: 127.0.0.1' },
                        { type: 'error', content: '[!!] COUNTERATTACK INITIALIZED...' },
                        { type: 'warn', content: '// Kidding. Nice try, script kiddie. 😄' },
                    ]);
                }, 300);
                endTime = 2500;
                break;

            case clean === 'history':
                endTime = addLines(
                    cmdHistory.map((c, i) => ({
                        type: 'output' as TerminalLine['type'],
                        content: `  ${String(i + 1).padStart(3)}  ${c}`,
                    }))
                );
                break;

            default:
                endTime = addLines([
                    { type: 'error', content: `bash: ${clean}: command not found` },
                    { type: 'output', content: 'Type "help" for available commands.' },
                ]);
        }

        setTimeout(() => setIsProcessing(false), endTime + 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;
        setCmdHistory(prev => [...prev, input]);
        setHistoryIndex(-1);
        handleCommand(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
            setHistoryIndex(newIndex);
            setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || '');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            setInput(newIndex === -1 ? '' : cmdHistory[cmdHistory.length - 1 - newIndex] || '');
        }
    };

    return (
        <>
            {/* Red Alert Overlay */}
            <AnimatePresence>
                {redAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.7, 1, 0.5, 1] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, repeat: 3 }}
                        className="fixed inset-0 z-[9999] bg-red-600/30 pointer-events-none"
                        style={{ mixBlendMode: 'screen' }}
                    />
                )}
            </AnimatePresence>

            <div
                className="w-full max-w-4xl mx-auto h-[340px] md:h-[440px] bg-black/90 border border-neon-green/30 font-mono text-xs md:text-sm relative overflow-hidden glass-card crt-flicker"
                onClick={() => inputRef.current?.focus()}
            >
                {/* Terminal Header */}
                <div className="bg-neon-green/10 border-b border-neon-green/20 px-4 py-1.5 flex justify-between items-center">
                    <div className="flex space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-red/70 border border-neon-red/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 border border-yellow-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-green/70 border border-neon-green/30" />
                    </div>
                    <div className="text-[10px] text-neon-green/50 uppercase tracking-widest flex items-center gap-2">
                        <motion.div
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-neon-green"
                        />
                        Secure Terminal v2.0.4
                    </div>
                    <div className="text-[9px] text-neon-green/30 font-mono">
                        {isProcessing ? '[ PROCESSING... ]' : '[ READY ]'}
                    </div>
                </div>

                {/* Terminal Content */}
                <div
                    ref={scrollRef}
                    className="p-4 h-[270px] md:h-[370px] overflow-y-auto scrollbar-hide space-y-0.5"
                >
                    <AnimatePresence>
                        {history.map((line, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`leading-snug ${
                                    line.type === 'input'   ? 'text-white font-bold' :
                                    line.type === 'error'   ? 'text-neon-red' :
                                    line.type === 'success' ? 'text-neon-green' :
                                    line.type === 'warn'    ? 'text-yellow-400' :
                                    line.type === 'progress'? 'text-neon-cyan font-bold' :
                                    line.type === 'system'  ? 'text-neon-green/40' :
                                    'text-neon-green/70'
                                }`}
                            >
                                {line.content}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex items-center mt-1">
                        <span className="text-neon-green font-bold mr-2">❯</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => { setInput(e.target.value); playHackerSound(); }}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-neon-green p-0 focus:ring-0 caret-neon-green"
                            autoFocus
                            disabled={isProcessing}
                            placeholder={isProcessing ? '' : ''}
                        />
                    </form>
                </div>

                {/* Scanline overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,255,255,0.06))] bg-[length:100%_4px,3px_100%]" />

                {/* Active scanline bar */}
                <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                    className="pointer-events-none absolute left-0 w-full h-[2px] bg-neon-green/10"
                    style={{ position: 'absolute' }}
                />
            </div>
        </>
    );
}
