import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const VolumeChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">
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
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <Tooltip content={<CustomChartTooltip suffix=" shipments" />} cursor={{ fill: '#f8fafc', radius: 8 }} />
            <Bar dataKey="value" name="Volume" fill="url(#colorValue)" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VolumeChart;
