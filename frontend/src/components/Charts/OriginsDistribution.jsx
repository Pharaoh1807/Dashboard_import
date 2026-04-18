import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

// Premium High-Tech Cyber Palette
const NEON_COLORS = [
  // Primary: Hot Pink / Neon Magenta (#FF1493 → #FF00AA)
  { start: '#FF1493', end: '#FF00AA', glow: '#FF2EC4' }, 
  // Harmonious Accents: Cyber Blue, Electric Violet, Deep Cyan, Digital Indigo
  { start: '#00D2FF', end: '#3A7BD5', glow: '#00D2FF' },
  { start: '#7000FF', end: '#4A00E0', glow: '#7000FF' },
  { start: '#00F5A0', end: '#00D9F5', glow: '#00F5A0' },
  { start: '#4E54C8', end: '#8F94FB', glow: '#4E54C8' }
];

const OriginsDistribution = ({ data, isDark }) => {
  const chartData = data?.charts?.originsDistribution || [];

  return (
    <div className={`p-4 md:p-5 rounded-[2.5rem] shadow-2xl flex flex-col transition-all duration-500 border ${isDark ? 'bg-[#11111d] border-slate-800 shadow-black/40' : 'bg-white border-slate-100'}`}>
      <div className="mb-4">
        <h3 className={`text-sm font-black tracking-widest uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Distribution</h3>
        <p className={`text-[7px] font-black tracking-widest uppercase -mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Top 5 Origins</p>
      </div>

      <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8">
        {/* Pie Container */}
        <div className="h-[180px] w-full xl:flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {NEON_COLORS.map((color, index) => (
                  <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color.start} />
                    <stop offset="100%" stopColor={color.end} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                nameKey="origins"
                animationBegin={0}
                animationDuration={1500}
                stroke="none"
                // Implementing same glow style as KPI cards (shadow-color/20 equivalent)
                style={{ 
                  filter: isDark ? 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.15))' : 'none',
                  outline: 'none'
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#grad-${index % NEON_COLORS.length})`}
                    // Exact 20% opacity glow (Hex suffix 33)
                    style={{ 
                      filter: isDark ? `drop-shadow(0 0 10px ${NEON_COLORS[index % NEON_COLORS.length].glow}33)` : 'none' 
                    }}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomChartTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Cards Container */}
        <div className="w-full xl:w-[150px] grid grid-cols-1 gap-1">
          {chartData.map((entry, index) => (
            <div
              key={entry.origins}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all hover:scale-[1.01] ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
            >
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${NEON_COLORS[index % NEON_COLORS.length].start}, ${NEON_COLORS[index % NEON_COLORS.length].end})`,
                    // Exact 20% opacity shadow like KPI cards
                    boxShadow: isDark ? `0 0 8px ${NEON_COLORS[index % NEON_COLORS.length].glow}33` : 'none'
                  }}
                />
                <span className={`text-[9px] font-black uppercase tracking-tight truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {entry.origins}
                </span>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-[9px] font-black ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                  ${(entry.value / 1e6).toFixed(1)}M
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OriginsDistribution;
