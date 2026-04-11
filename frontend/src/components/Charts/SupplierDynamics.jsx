import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';
import { COLORS } from '../../constants';

const SupplierDynamics = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Supplier Dynamics ({data?.charts?.isYearly ? 'Yearly' : 'Monthly'})
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1 tracking-tight">Tracking top 5 shippers</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end max-w-[300px]">
          {data?.charts?.shippersTrendList?.map((shipper, idx) => (
            <div key={shipper} className="flex items-center gap-2 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
              <div className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-[9px] font-black text-slate-600 uppercase truncate max-w-[80px] tracking-tight">{shipper}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data?.charts?.shippersTrend || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <Tooltip content={<CustomChartTooltip suffix=" shipments" />} />
            {data?.charts?.shippersTrendList?.map((shipper, idx) => (
              <Line
                key={shipper}
                type="monotone"
                dataKey={shipper}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[idx % COLORS.length] }}
                animationDuration={2000}
                strokeLinecap="round"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplierDynamics;
