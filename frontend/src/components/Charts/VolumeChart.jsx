import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const VolumeChart = ({ data, isDark }) => {
  return (
    <div className={`p-6 rounded-[1.5rem] shadow-sm transition-all duration-300 border ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/20 hover:shadow-primary-500/5' : 'bg-white border-slate-100'}`}>
      <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {data?.charts?.isYearly ? 'Yearly' : 'Monthly'} Volume
      </h3>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.charts?.monthlyTrend || []}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.8} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <Tooltip content={<CustomChartTooltip suffix=" shipments" isDark={isDark} />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)', radius: 8 }} />
            <Bar 
              dataKey="value" 
              name="Volume" 
              fill="url(#colorValue)" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
              style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' : 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VolumeChart;
