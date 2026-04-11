import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';
import { COLORS } from '../../constants';

const EconomicDistribution = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Economic Distribution</h3>
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data?.charts?.originsDistribution || []}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={0}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              nameKey="origins"
              stroke="none"
            >
              {(data?.charts?.originsDistribution || []).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip prefix="$" />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Summary Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest">Share</span>
          <span className="block text-sm font-black text-slate-900 mt-0.5">
            ${Math.round((data?.kpis?.totalValue || 0) / 1000000)}M
          </span>
        </div>
      </div>
    </div>
  );
};

export default EconomicDistribution;
