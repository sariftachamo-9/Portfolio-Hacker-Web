import React from 'react';
import { motion } from 'motion/react';
import { Experience, Education } from '../types';
import { Briefcase, GraduationCap } from 'lucide-react';

interface TimelineProps {
  items: (Experience | Education)[];
  type: 'experience' | 'education';
}

export default function Timeline({ items, type }: TimelineProps) {
  const isExperience = type === 'experience';

  return (
    <div className="space-y-8">
      {items.map((item, idx) => {
        const isExp = isExperience as boolean;
        const title = isExp ? (item as Experience).role : (item as Education).degree;
        const subtitle = isExp ? (item as Experience).organization : (item as Education).institution;
        const duration = item.duration;
        const description = isExp ? (item as Experience).description : (item as Education).focus;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-6 group"
          >
            {/* Timeline marker */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.2 }}
                className="relative z-10 w-12 h-12 rounded-full border-2 border-neon-green bg-black flex items-center justify-center group-hover:border-neon-green group-hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] transition-all"
              >
                {isExp ? (
                  <Briefcase size={20} className="text-neon-green" />
                ) : (
                  <GraduationCap size={20} className="text-neon-green" />
                )}
              </motion.div>

              {/* Vertical line (except for last item) */}
              {idx !== items.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: '100px' }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="w-0.5 h-24 bg-gradient-to-b from-neon-green/60 to-transparent mt-2"
                />
              )}
            </div>

            {/* Content */}
            <motion.div
              whileHover={{ x: 8 }}
              className="flex-1 pt-2 pb-8"
            >
              <div className="glass-card p-6 border-neon-green/20 hover:border-neon-green/40 transition-all group-hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                {/* Meta */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                  <h3 className="text-lg font-bold text-neon-green uppercase tracking-tight">
                    {title}
                  </h3>
                  <span className="text-neon-green/40 text-xs font-mono bg-neon-green/5 px-3 py-1 w-fit">
                    [{duration}]
                  </span>
                </div>

                {/* Organization/Institution */}
                <div className="text-neon-green/50 text-sm mb-3 font-mono flex items-center gap-2">
                  <span className="text-neon-green/30">{">"}</span>
                  {subtitle}
                </div>

                {/* Description */}
                <p className="text-neon-green/40 text-xs leading-relaxed font-mono italic border-l-2 border-neon-green/20 pl-4">
                  {description}
                </p>

                {/* Status indicator */}
                <div className="mt-3 flex items-center gap-2 text-[9px] text-neon-green/30 font-mono">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 rounded-full bg-neon-green"
                  />
                  {isExp ? 'MISSION_LOGGED' : 'CREDENTIALS_SECURED'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
