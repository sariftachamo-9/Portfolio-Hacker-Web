import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alert, setAlert] = useState<string | null>(null);

  const ALERTS = [
    'INTRUSION_ATTEMPT BLOCKED → 185.220.101.x',
    'SQL_INJECT BLOCKED → /api/login',
    'BRUTE_FORCE NEUTRALIZED → 43.21.8.112',
    'XSS_PAYLOAD SANITIZED → /search',
    'PORT_SCAN DETECTED → 192.168.0.x',
    'ZERO_DAY PROBE BLOCKED',
  ];

  // Random alert flash every 20-40 seconds
  useEffect(() => {
    const fireAlert = () => {
      const msg = ALERTS[Math.floor(Math.random() * ALERTS.length)];
      setAlert(msg);
      setTimeout(() => setAlert(null), 2200);
    };

    // First alert after 12s
    const first = setTimeout(fireAlert, 12000);

    const interval = setInterval(() => {
      fireAlert();
    }, 20000 + Math.random() * 20000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Layer 1: Classic matrix characters
    const ASCII = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/';
    // Layer 2: Hex strings
    const HEX_POOL = ['0xDEADBEEF', '0xCAFEBABE', '0xBADC0DE', '0xDEADC0DE', '0xFEEDFACE', '0x8BADF00D', '0xBAADF00D'];

    const fontSize = 14;
    const smallFont = 10;
    const cols1 = Math.ceil(canvas.width / fontSize);

    // Matrix drop positions
    const drops: number[] = Array.from({ length: cols1 }, () => Math.random() * -50);
    // Hex drift columns (sparser)
    const hexCols = Math.ceil(canvas.width / 80);
    const hexDrops: number[] = Array.from({ length: hexCols }, () => Math.random() * canvas.height);

    let frame = 0;

    const draw = () => {
      frame++;

      // Fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Layer 1: Green matrix rain
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = ASCII.charAt(Math.floor(Math.random() * ASCII.length));
        // Leading char is brighter
        const yPos = drops[i] * fontSize;
        ctx.fillStyle = drops[i] > 1
          ? `rgba(0, ${180 + Math.floor(Math.random() * 75)}, ${40 + Math.floor(Math.random() * 30)}, 0.85)`
          : '#FFFFFF';
        ctx.fillText(text, i * fontSize, yPos);

        if (yPos > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      // Layer 2: Cyan/blue floating hex strings (upward drift every 2 frames)
      if (frame % 2 === 0) {
        ctx.font = `${smallFont}px monospace`;
        for (let i = 0; i < hexCols; i++) {
          const hex = HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)];
          const x = i * 80 + Math.sin(frame * 0.01 + i) * 8;
          ctx.fillStyle = `rgba(0, 200, 255, ${0.06 + Math.random() * 0.08})`;
          ctx.fillText(hex, x, hexDrops[i]);
          hexDrops[i] -= 0.4;
          if (hexDrops[i] < -20) hexDrops[i] = canvas.height + 20;
        }
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 opacity-40 pointer-events-none"
      />

      {/* Random intrusion alert flash */}
      <AnimatePresence>
        {alert && (
          <motion.div
            key={alert}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-4 z-[200] pointer-events-none"
          >
            <div className="bg-black/90 border border-neon-red/70 px-4 py-2 font-mono text-[10px] text-neon-red flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,60,0.4)]">
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-neon-red"
              />
              <span className="uppercase tracking-widest">[ALERT] {alert}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
