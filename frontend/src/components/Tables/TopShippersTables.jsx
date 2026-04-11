import React from 'react';
import {
  TrendingUp,
  Activity
} from 'lucide-react';

const TopShippersTables = ({ data }) => {
  const topShippersByValue = data?.charts?.topShippers || [];
  const topShippersByShipments = data?.charts?.shippersByShipments || [];
  const totalValue = data?.kpis?.totalValue || 1;
  const totalShipments = data?.kpis?.totalShipments || 1;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
      {/* Table 1: By Value */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Top Shippers by Value</h3>
          </div>
          <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase">USD Focused</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 w-12 text-center">#</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400">Shipper</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 text-right pr-4">Total Value</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 w-32">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topShippersByValue.map((sh, idx) => {
                const maxVal = topShippersByValue?.[0]?.value || 1;
                const percentage = (sh.value / totalValue) * 100;
                const widthPerc = (sh.value / maxVal) * 100;

                return (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    </td>
                    <td className="py-4 font-bold text-slate-700 text-xs truncate max-w-[150px]" title={sh.shipper}>{sh.shipper}</td>
                    <td className="py-4 text-right font-black text-slate-900 text-xs pr-4">${Math.round(sh.value).toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500" style={{ width: `${widthPerc}%` }}></div>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: By Shipment Count */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Shipment Leaders</h3>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Volume Based</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 w-12 text-center">#</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400">Shipper</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 text-right pr-4">Bills</th>
                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 w-32">Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topShippersByShipments.map((sh, idx) => {
                const maxCount = topShippersByShipments?.[0]?.count || 1;
                const percentage = (sh.count / totalShipments) * 100;
                const widthPerc = (sh.count / maxCount) * 100;

                return (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    </td>
                    <td className="py-4 font-bold text-slate-700 text-xs truncate max-w-[150px]" title={sh.shipper}>{sh.shipper}</td>
                    <td className="py-4 text-right font-black text-slate-900 text-xs pr-4">{sh.count.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${widthPerc}%` }}></div>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopShippersTables;
