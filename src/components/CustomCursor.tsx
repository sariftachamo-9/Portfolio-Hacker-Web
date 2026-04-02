import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';

interface Spark {
  id: number;
  x: number;
  y: number;
}

interface ClickReticle {
  id: number;
  x: number;
  y: number;
}

let sparkId = 0;
let reticleId = 0;

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverLabel, setHoverLabel] = useState('');
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [reticles, setReticles] = useState<ClickReticle[]>([]);
  const mouseX = useSpring(0, { stiffness: 800, damping: 35 });
  const mouseY = useSpring(0, { stiffness: 800, damping: 35 });
  const lastPos = useRef({ x: 0, y: 0 });
  const sparkThrottle = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCoords({ x: e.clientX, y: e.clientY });

      // Spark trail on fast movement
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastPos.current = { x: e.clientX, y: e.clientY };

      if (speed > 12 && Date.now() - sparkThrottle.current > 40) {
        sparkThrottle.current = Date.now();
        const id = sparkId++;
        setSparks(prev => [...prev.slice(-8), { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setSparks(prev => prev.filter(s => s.id !== id)), 400);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const id = reticleId++;
      setReticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setReticles(prev => prev.filter(r => r.id !== id)), 600);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target.tagName === 'A' || target.closest('a');
      const isBtn = target.tagName === 'BUTTON' || target.closest('button');
      const isImg = target.tagName === 'IMG' || target.closest('img');
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isLink) { setIsHovering(true); setHoverLabel('NAVIGATE'); }
      else if (isBtn) { setIsHovering(true); setHoverLabel('EXECUTE'); }
      else if (isImg) { setIsHovering(true); setHoverLabel('SCAN'); }
      else if (isInput) { setIsHovering(true); setHoverLabel('INPUT'); }
      else { setIsHovering(false); setHoverLabel(''); }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const toHex = (n: number) => `0x${n.toString(16).toUpperCase().padStart(4, '0')}`;

  return (
    <>
      {/* Main cursor block */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      >
        {/* Cursor body */}
        <motion.div
          className="w-3 h-4 bg-neon-green"
          animate={{ scaleX: isHovering ? 2.5 : 1, scaleY: isHovering ? 1.5 : 1, opacity: [1, 0.5, 1] }}
          transition={{ opacity: { repeat: Infinity, duration: 0.8 }, scaleX: { duration: 0.15 }, scaleY: { duration: 0.15 } }}
        />
      </motion.div>

      {/* Hex coordinate display */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] font-mono text-[9px] text-neon-green/50 select-none"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '14px',
          translateY: '12px',
        }}
      >
        [{toHex(coords.x)}, {toHex(coords.y)}]
      </motion.div>

      {/* Context hover label */}
      <AnimatePresence>
        {hoverLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 pointer-events-none z-[9998] font-mono text-[9px] text-neon-green font-bold select-none"
            style={{
              x: mouseX,
              y: mouseY,
              translateX: '14px',
              translateY: '-18px',
            }}
          >
            [ {hoverLabel} → ]
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spark trail particles */}
      {sparks.map(spark => (
        <motion.div
          key={spark.id}
          initial={{ opacity: 0.8, scale: 1, x: spark.x, y: spark.y }}
          animate={{ opacity: 0, scale: 0.2, y: spark.y - 10 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-neon-green rounded-full pointer-events-none z-[9997] shadow-[0_0_4px_#00FF41]"
          style={{ translateX: '-50%', translateY: '-50%' }}
        />
      ))}

      {/* Click reticle */}
      {reticles.map(r => (
        <motion.div
          key={r.id}
          initial={{ width: 10, height: 10, opacity: 1, borderWidth: 2 }}
          animate={{ width: 50, height: 50, opacity: 0, borderWidth: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="fixed top-0 left-0 border border-neon-green rounded-none pointer-events-none z-[9996]"
          style={{
            left: r.x,
            top: r.y,
            translateX: '-50%',
            translateY: '-50%',
            boxShadow: '0 0 8px rgba(0,255,65,0.5)',
          }}
        >
          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neon-green/60 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neon-green/60 -translate-x-1/2" />
        </motion.div>
      ))}
    </>
  );
}
