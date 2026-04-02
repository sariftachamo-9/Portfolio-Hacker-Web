import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: number;
  time: string;
  type: 'ok' | 'warn' | 'blocked' | 'info';
  message: string;
}

const LOG_POOL = [
  { type: 'ok', message: 'PORT_SCAN → 443 OPEN' },
  { type: 'ok', message: 'SSH_LOGIN → sarif@localhost' },
  { type: 'ok', message: 'TLS_CERT VERIFIED: RSA-4096' },
  { type: 'ok', message: 'VPN_TUNNEL ESTABLISHED' },
  { type: 'ok', message: 'CRYPTO_KEY ROTATED' },
  { type: 'ok', message: 'ARP_TABLE UPDATED' },
  { type: 'ok', message: 'PACKET_CAPTURED: 1,204 bytes' },
  { type: 'ok', message: 'FIREWALL RULES SYNCED' },
  { type: 'ok', message: 'HASH VERIFIED: SHA-256' },
  { type: 'ok', message: 'KERNEL WATCHDOG: NOMINAL' },
  { type: 'ok', message: 'DNS_CACHE FLUSHED' },
  { type: 'ok', message: 'SESSION_TOKEN REFRESHED' },
  { type: 'ok', message: 'MEMORY_SCAN: CLEAN' },
  { type: 'ok', message: 'BACKUP_SYNC COMPLETE' },
  { type: 'info', message: 'PACKET_FLOOD: 8,102 bytes/s' },
  { type: 'info', message: 'CPU_LOAD: 12% — NOMINAL' },
  { type: 'info', message: 'NET_LATENCY: 4ms' },
  { type: 'info', message: 'UPTIME: 99.97%' },
  { type: 'info', message: 'ENCRYPTED_TRAFFIC: 100%' },
  { type: 'warn', message: 'FIREWALL RULE #47 TRIGGERED' },
  { type: 'warn', message: 'PORT_KNOCK DETECTED: 22' },
  { type: 'warn', message: 'PAYLOAD_SIZE ANOMALY' },
  { type: 'warn', message: 'RATE_LIMIT: 1k req/min' },
  { type: 'warn', message: 'TOKEN_EXPIRY: 5min left' },
  { type: 'blocked', message: 'INTRUSION_ATTEMPT → 43.21.x.x' },
  { type: 'blocked', message: 'SQL_INJECT BLOCKED → /api' },
  { type: 'blocked', message: 'BRUTE_FORCE BLOCKED: 127x' },
  { type: 'blocked', message: 'XSS_PAYLOAD SANITIZED' },
  { type: 'blocked', message: 'DDoS_VECTOR NEUTRALIZED' },
] as const;

const getTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

let globalId = 0;

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: globalId++,
      time: getTime(),
      type: LOG_POOL[i % LOG_POOL.length].type as LogEntry['type'],
      message: LOG_POOL[i % LOG_POOL.length].message,
    }))
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      const newLog: LogEntry = {
        id: globalId++,
        time: getTime(),
        type: entry.type as LogEntry['type'],
        message: entry.message,
      };
      setLogs(prev => [...prev.slice(-24), newLog]);
    }, 2000 + Math.random() * 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const colorMap = {
    ok: 'text-neon-green',
    info: 'text-neon-cyan',
    warn: 'text-yellow-400',
    blocked: 'text-neon-red',
  };

  const prefixMap = {
    ok: '[OK]',
    info: '[--]',
    warn: '[!!]',
    blocked: '[XX]',
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-52 z-30 hidden xl:flex flex-col pointer-events-none select-none">
      {/* Header */}
      <div className="bg-black/80 border-l border-b border-neon-green/20 px-3 py-2 flex items-center gap-2">
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-neon-green"
        />
        <span className="text-[9px] font-mono uppercase tracking-widest text-neon-green/50">
          SYS_LOG ◉ LIVE
        </span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-hidden bg-black/60 border-l border-neon-green/10 backdrop-blur-sm">
        <div className="h-full overflow-y-auto scrollbar-hide p-2 space-y-1.5 flex flex-col justify-end">
          <AnimatePresence initial={false}>
            {logs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-[8.5px] leading-tight"
              >
                <span className="text-neon-green/30">[{log.time}]</span>
                <br />
                <span className={`font-bold ${colorMap[log.type]}`}>
                  {prefixMap[log.type]}
                </span>{' '}
                <span className={`${colorMap[log.type]} opacity-70`}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Footer stats */}
      <div className="bg-black/80 border-l border-t border-neon-green/20 px-3 py-2 space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-neon-green/30 uppercase">
          <span>FIREWALL</span>
          <span className="text-neon-green">ACTIVE</span>
        </div>
        <div className="flex justify-between text-[8px] font-mono text-neon-green/30 uppercase">
          <span>ENCRYPT</span>
          <span className="text-neon-green">AES-256</span>
        </div>
        <div className="flex justify-between text-[8px] font-mono text-neon-green/30 uppercase">
          <span>VPN</span>
          <span className="text-neon-green">ONLINE</span>
        </div>
      </div>
    </div>
  );
}
