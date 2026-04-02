import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Attack {
  id: number;
  origin: { x: number; y: number; label: string; ip: string; country: string };
  vector: string;
  status: 'TRACKING' | 'NEUTRALIZED';
  progress: number;
}

// SVG map is 960x500 viewBox. Nepal approx coords:
const NEPAL = { x: 720, y: 195 };

const ORIGINS = [
  { x: 820, y: 140, label: 'Beijing, CN', ip: '220.181.x.x', country: 'CN' },
  { x: 750, y: 100, label: 'Moscow, RU', ip: '185.220.x.x', country: 'RU' },
  { x: 460, y: 130, label: 'London, UK', ip: '45.142.x.x', country: 'UK' },
  { x: 160, y: 190, label: 'New York, US', ip: '104.31.x.x', country: 'US' },
  { x: 200, y: 155, label: 'Toronto, CA', ip: '66.249.x.x', country: 'CA' },
  { x: 500, y: 135, label: 'Frankfurt, DE', ip: '141.98.x.x', country: 'DE' },
  { x: 870, y: 180, label: 'Tokyo, JP', ip: '60.249.x.x', country: 'JP' },
  { x: 650, y: 170, label: 'Istanbul, TR', ip: '88.249.x.x', country: 'TR' },
  { x: 320, y: 350, label: 'São Paulo, BR', ip: '179.108.x.x', country: 'BR' },
  { x: 530, y: 260, label: 'Lagos, NG', ip: '41.86.x.x', country: 'NG' },
  { x: 750, y: 320, label: 'Mumbai, IN', ip: '103.48.x.x', country: 'IN' },
];

const VECTORS = ['SQL_INJECTION', 'XSS_PAYLOAD', 'BRUTE_FORCE', 'ZERO_DAY', 'DDoS_FLOOD', 'PORT_SCAN', 'PHISHING', 'RANSOMWARE'];

// Simplified world map path data (continental outlines)
const WORLD_PATH = `
M 50 180 L 120 160 L 180 155 L 220 150 L 260 155 L 300 165 L 330 175 L 350 185 L 360 200 L 340 220 L 320 240 L 300 260 L 280 280 L 260 310 L 240 340 L 220 360 L 200 370 L 180 360 L 160 340 L 140 310 L 120 290 L 100 270 L 80 250 L 60 230 L 50 210 Z
M 380 120 L 450 110 L 520 115 L 580 120 L 620 130 L 640 145 L 650 165 L 640 185 L 620 200 L 600 210 L 580 215 L 550 210 L 520 200 L 490 195 L 460 190 L 430 185 L 410 175 L 390 160 L 380 145 Z
M 660 100 L 720 95 L 780 100 L 840 105 L 890 115 L 920 130 L 930 150 L 920 170 L 900 185 L 880 195 L 860 200 L 840 205 L 810 210 L 780 215 L 750 210 L 720 200 L 700 185 L 680 170 L 665 150 L 660 130 Z
M 580 250 L 640 240 L 700 245 L 740 255 L 760 270 L 750 290 L 730 305 L 700 315 L 670 315 L 640 308 L 615 295 L 598 278 Z
M 250 370 L 310 360 L 360 365 L 390 380 L 400 400 L 390 420 L 360 440 L 320 450 L 280 445 L 250 430 L 235 410 L 240 390 Z
M 440 300 L 510 290 L 560 295 L 580 315 L 570 340 L 545 355 L 510 360 L 475 355 L 450 340 L 440 320 Z
`;

let attackId = 0;

export default function ThreatMap() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [log, setLog] = useState<{ id: number; msg: string; type: 'warn' | 'blocked' }[]>([]);
  const [nepalPulse, setNepalPulse] = useState(false);

  useEffect(() => {
    // Initial attacks
    const init = ORIGINS.slice(0, 3).map((o, i) => ({
      id: attackId++,
      origin: o,
      vector: VECTORS[i % VECTORS.length],
      status: 'TRACKING' as const,
      progress: 0,
    }));
    setAttacks(init);

    // Progress existing attacks
    const progressInterval = setInterval(() => {
      setAttacks(prev => prev.map(a => {
        if (a.progress >= 100) return a;
        const delta = Math.random() * 8 + 4;
        const newProg = Math.min(a.progress + delta, 100);
        if (newProg >= 100 && a.status === 'TRACKING') {
          // Neutralized
          setNepalPulse(true);
          setTimeout(() => setNepalPulse(false), 600);
          const msg = `${a.origin.ip} [${a.vector}] → NEUTRALIZED`;
          setLog(prev => [...prev.slice(-6), { id: Date.now(), msg, type: 'blocked' }]);
          return { ...a, progress: 100, status: 'NEUTRALIZED' as const };
        }
        return { ...a, progress: newProg };
      }));
    }, 150);

    // Add new attacks periodically
    const spawnInterval = setInterval(() => {
      const origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
      const vector = VECTORS[Math.floor(Math.random() * VECTORS.length)];
      const newAttack: Attack = {
        id: attackId++,
        origin,
        vector,
        status: 'TRACKING',
        progress: 0,
      };
      setAttacks(prev => [...prev.filter(a => a.progress < 100 || Date.now() - a.id < 8000).slice(-6), newAttack]);
      setLog(prev => [...prev.slice(-6), {
        id: Date.now(),
        msg: `${origin.ip} [${vector}] → TRACKING`,
        type: 'warn',
      }]);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(spawnInterval);
    };
  }, []);

  // Arc path from origin to Nepal via quadratic bezier
  const getArcPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 80;
    return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
  };

  const getProgress = (progress: number) => {
    const filled = Math.floor(progress / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-2 rounded-full bg-neon-red"
            />
            <h2 className="text-4xl font-bold glitch">THREAT_MONITOR</h2>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-2 rounded-full bg-neon-red"
            />
          </div>
          <p className="text-neon-green/40 text-xs uppercase tracking-widest font-mono">
            ◉ LIVE — Global attack vectors targeting SARIF_SEC infrastructure
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 glass-card p-4 relative overflow-hidden">
            <div className="text-[9px] font-mono text-neon-green/30 uppercase tracking-widest mb-2 flex justify-between">
              <span>GLOBAL_THREATMAP — REALTIME</span>
              <span>{attacks.filter(a => a.status === 'TRACKING').length} ACTIVE VECTORS</span>
            </div>

            <svg
              viewBox="0 0 960 500"
              className="w-full h-auto"
              style={{ maxHeight: '360px' }}
            >
              {/* Map backdrop */}
              <rect width="960" height="500" fill="rgba(0,0,0,0.8)" />

              {/* Grid lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <line
                  key={`vg${i}`}
                  x1={i * 96} y1={0} x2={i * 96} y2={500}
                  stroke="rgba(0,255,65,0.04)" strokeWidth="1"
                />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={`hg${i}`}
                  x1={0} y1={i * 83} x2={960} y2={i * 83}
                  stroke="rgba(0,255,65,0.04)" strokeWidth="1"
                />
              ))}

              {/* Simplified continent shapes */}
              <path d={WORLD_PATH} fill="rgba(0,255,65,0.07)" stroke="rgba(0,255,65,0.15)" strokeWidth="0.8" />

              {/* Origin city dots */}
              {ORIGINS.map((o, i) => (
                <g key={i}>
                  <circle cx={o.x} cy={o.y} r={2} fill="rgba(255,60,0,0.6)" />
                  <text x={o.x + 5} y={o.y + 4} fontSize="7" fill="rgba(255,100,0,0.5)" fontFamily="monospace">
                    {o.country}
                  </text>
                </g>
              ))}

              {/* Attack arcs */}
              {attacks.map(attack => {
                const pathStr = getArcPath(attack.origin, NEPAL);
                const isDone = attack.status === 'NEUTRALIZED';
                return (
                  <g key={attack.id}>
                    {/* Base arc */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke={isDone ? 'rgba(0,255,65,0.15)' : 'rgba(255,60,0,0.2)'}
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                    {/* Animated progress arc */}
                    {!isDone && (
                      <motion.path
                        d={pathStr}
                        fill="none"
                        stroke="rgba(255,60,0,0.8)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: attack.progress / 100 }}
                        transition={{ duration: 0.1 }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,60,0.8))' }}
                      />
                    )}
                    {/* Origin flash */}
                    <circle
                      cx={attack.origin.x}
                      cy={attack.origin.y}
                      r={isDone ? 0 : 4}
                      fill="none"
                      stroke="rgba(255,60,0,0.7)"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Nepal target — Bhaktapur */}
              <motion.circle
                cx={NEPAL.x}
                cy={NEPAL.y}
                r={nepalPulse ? 16 : 8}
                fill="none"
                stroke="rgba(0,255,65,0.3)"
                strokeWidth="1"
                animate={{ r: nepalPulse ? [8, 20, 8] : [6, 10, 6] }}
                transition={{ repeat: Infinity, duration: nepalPulse ? 0.4 : 2 }}
              />
              <circle
                cx={NEPAL.x}
                cy={NEPAL.y}
                r={4}
                fill={nepalPulse ? '#00FF41' : 'rgba(0,255,65,0.8)'}
                style={{ filter: 'drop-shadow(0 0 6px #00FF41)' }}
              />
              <text
                x={NEPAL.x + 8}
                y={NEPAL.y - 8}
                fontSize="8"
                fill="rgba(0,255,65,0.8)"
                fontFamily="monospace"
                fontWeight="bold"
              >
                BHAKTAPUR [DEFENDED]
              </text>
            </svg>

            <div className="text-[9px] font-mono text-neon-green/20 mt-2 text-center tracking-widest">
              ● ACTIVE THREAT &nbsp;&nbsp; ● NEUTRALIZED &nbsp;&nbsp; ● BHAKTAPUR, NP
            </div>
          </div>

          {/* Attack log + active cards */}
          <div className="flex flex-col gap-4">
            {/* Active attacks */}
            <div className="glass-card p-4 border-neon-green/10 flex-1">
              <div className="text-[9px] font-mono text-neon-green/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 h-1 rounded-full bg-neon-red" />
                ACTIVE_VECTORS
              </div>
              <div className="space-y-3 overflow-hidden" style={{ maxHeight: '220px' }}>
                {attacks.filter(a => a.status === 'TRACKING').slice(0, 4).map(attack => (
                  <motion.div
                    key={attack.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-neon-red/20 p-2 bg-neon-red/5 font-mono"
                  >
                    <div className="text-[8px] text-neon-red/70 flex justify-between mb-1">
                      <span>{attack.origin.ip}</span>
                      <span>{attack.origin.country}</span>
                    </div>
                    <div className="text-[8px] text-yellow-400 mb-1.5 font-bold">[{attack.vector}]</div>
                    <div className="text-[8px] text-neon-green/70">
                      [{getProgress(attack.progress)}] {Math.floor(attack.progress)}%
                    </div>
                  </motion.div>
                ))}
                {attacks.filter(a => a.status === 'TRACKING').length === 0 && (
                  <div className="text-[9px] text-neon-green/30 font-mono text-center py-4">
                    ALL VECTORS NEUTRALIZED
                  </div>
                )}
              </div>
            </div>

            {/* Event log */}
            <div className="glass-card p-4 border-neon-green/10">
              <div className="text-[9px] font-mono text-neon-green/40 uppercase tracking-widest mb-3">
                EVENT_LOG
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-hidden">
                <AnimatePresence>
                  {log.slice(-6).map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[8px] font-mono ${entry.type === 'blocked' ? 'text-neon-green/70' : 'text-yellow-400/70'}`}
                    >
                      <span className={`font-bold ${entry.type === 'blocked' ? 'text-neon-green' : 'text-yellow-400'}`}>
                        {entry.type === 'blocked' ? '[✓]' : '[!]'}
                      </span>{' '}
                      {entry.msg}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'ATTACKS_BLOCKED', value: '2,847', color: 'text-neon-green' },
            { label: 'ACTIVE_THREATS', value: String(attacks.filter(a => a.status === 'TRACKING').length), color: 'text-neon-red' },
            { label: 'UPTIME', value: '99.97%', color: 'text-neon-cyan' },
            { label: 'FIREWALL_RULES', value: '247', color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 text-center border-neon-green/5">
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-neon-green/30 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
