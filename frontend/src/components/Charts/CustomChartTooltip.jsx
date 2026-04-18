import React from 'react';

const CustomChartTooltip = ({ active, payload, label, prefix = '', suffix = '', isDark }) => {
  if (active && payload && payload.length) {
    const isPie = payload[0].name === undefined;

    return (
      <div className={`backdrop-blur-xl p-5 rounded-[1.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[200px] animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-[#1e1e2f]/90 border-slate-700/50 shadow-black/50' : 'bg-white/90 border-slate-100 shadow-slate-200/50'}`}>
        <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label || 'Snapshot'}</p>
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-inner flex-shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill || '#3b82f6' }}
                />
                <span className={`text-[10px] font-bold leading-none flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isPie ? 'Share' : entry.name}</span>
              </div>
              <span className={`text-xs font-black tabular-nums ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {prefix}{entry.value.toLocaleString()}{suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default CustomChartTooltip;
