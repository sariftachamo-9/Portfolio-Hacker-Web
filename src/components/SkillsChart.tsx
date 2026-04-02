import React from 'react';
import { motion } from 'motion/react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Skill } from '../types';

interface SkillsChartProps {
  skills: Skill[];
}

export default function SkillsChart({ skills }: SkillsChartProps) {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc: Record<string, number>, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = 0;
    }
    acc[skill.category] = Math.max(acc[skill.category], skill.proficiency_level);
    return acc;
  }, {});

  // Transform to chart data
  const chartData = Object.entries(skillsByCategory).map(([category, proficiency]) => ({
    category: category.substring(0, 12), // Truncate for display
    fullCategory: category,
    proficiency: proficiency,
    fullMark: 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full h-96 flex items-center justify-center"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid stroke="rgba(0, 255, 65, 0.2)" />
          <PolarAngleAxis
            dataKey="category"
            stroke="rgba(0, 255, 65, 0.5)"
            style={{
              fontSize: '12px',
              fill: 'rgba(0, 255, 65, 0.7)',
              fontFamily: 'monospace'
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            stroke="rgba(0, 255, 65, 0.3)"
            style={{
              fontSize: '11px',
              fill: 'rgba(0, 255, 65, 0.5)',
              fontFamily: 'monospace'
            }}
          />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke="rgba(0, 255, 65, 1)"
            fill="rgba(0, 255, 65, 0.2)"
            strokeWidth={2}
            isAnimationActive={true}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(0, 255, 65, 0.5)',
              borderRadius: '0',
              fontFamily: 'monospace',
              color: 'rgba(0, 255, 65, 1)'
            }}
            labelStyle={{ color: 'rgba(0, 255, 65, 1)', fontWeight: 'bold' }}
            formatter={(value) => [`${value}%`, 'Level']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
