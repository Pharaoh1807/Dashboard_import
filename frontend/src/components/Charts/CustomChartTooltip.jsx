import React from 'react';

const CustomChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    const isPie = payload[0].name === undefined;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[1.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[200px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label || 'Snapshot'}</p>
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
                <span className="text-[10px] font-bold text-slate-500 leading-none flex items-center">{isPie ? 'Share' : entry.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900 tabular-nums">
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
