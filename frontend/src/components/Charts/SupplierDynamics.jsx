import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';
import { COLORS } from '../../constants';

const SupplierDynamics = ({ data, isDark }) => {
  return (
    <div className={`p-4 md:p-5 rounded-[2.5rem] shadow-2xl flex flex-col transition-all duration-500 border relative overflow-hidden ${
      isDark 
        ? 'bg-[#1e1e2f]/80 border-slate-800/50 backdrop-blur-xl shadow-black/40' 
        : 'bg-white/80 border-white/20 backdrop-blur-md shadow-slate-200/50'
    }`}>
      {/* Decorative background glow */}
      {isDark && <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 rounded-full blur-[80px]" />}
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 px-1 gap-4 z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
            <h3 className={`text-md font-black tracking-[0.15em] uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Supplier Dynamics
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] ml-3.5 italic opacity-80">
            Intelligent Shipping Analysis
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1.5 justify-start lg:justify-end max-w-full lg:max-w-[420px]">
          {data?.charts?.shippersTrendList?.map((shipper, idx) => (
            <div key={shipper} className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 ${
              isDark ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 border-slate-100 shadow-sm'
            }`}>
              <div 
                className="w-2 h-2 rounded-full shadow-lg transition-transform group-hover:scale-125" 
                style={{ 
                  backgroundColor: COLORS[idx % COLORS.length], 
                  boxShadow: isDark ? `0 0 10px ${COLORS[idx % COLORS.length]}40` : 'none' 
                }} 
              />
              <span className={`text-[9px] font-black uppercase truncate max-w-[100px] tracking-wider ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600'}`}>
                {shipper}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Maximized Chart Workspace */}
      <div className="flex-1 h-[300px] w-full -mb-4 -ml-2 z-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data?.charts?.shippersTrend || []} 
            margin={{ top: 20, right: 30, left: -25, bottom: 20 }}
          >
            {isDark && (
              <CartesianGrid 
                vertical={false} 
                stroke="#334155" 
                strokeDasharray="3 3" 
                strokeOpacity={0.2} 
              />
            )}
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
            />
            <Tooltip content={<CustomChartTooltip suffix=" shipments" isDark={isDark} />} />
            {data?.charts?.shippersTrendList?.map((shipper, idx) => (
              <Line
                key={shipper}
                type="monotone"
                dataKey={shipper}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2, 
                  stroke: isDark ? '#1e1e2f' : '#fff', 
                  fill: COLORS[idx % COLORS.length] 
                }}
                animationDuration={2500}
                strokeLinecap="round"
                // Balanced light glow
                style={{ filter: isDark ? `drop-shadow(0 0 5px ${COLORS[idx % COLORS.length]}33)` : 'none' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplierDynamics;
