import React from 'react';
import {
  TrendingUp,
  Activity
} from 'lucide-react';

const TopShippersTables = ({ data, isDark }) => {
  const topShippersByValue = data?.charts?.topShippers || [];
  const topShippersByShipments = data?.charts?.shippersByShipments || [];
  const totalValue = data?.kpis?.totalValue || 1;
  const totalShipments = data?.kpis?.totalShipments || 1;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
      {/* Table 1: By Value */}
      <div className={`p-8 rounded-[2rem] shadow-sm overflow-hidden transition-colors duration-300 border ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/20' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-primary-500/10' : 'bg-primary-50'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Top 10 Shippers by Value</h3>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${isDark ? 'text-primary-400 bg-primary-500/10' : 'text-primary-600 bg-primary-50'}`}>USD Focused</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                <th className={`pb-4 text-[10px] font-black uppercase w-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#</th>
                <th className={`pb-4 text-[10px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Shipper</th>
                <th className={`pb-4 text-[10px] font-black uppercase text-right pr-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Value</th>
                <th className={`pb-4 text-[10px] font-black uppercase w-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Share</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {topShippersByValue.map((sh, idx) => {
                const maxVal = topShippersByValue?.[0]?.value || 1;
                const percentage = (sh.value / totalValue) * 100;
                const widthPerc = (sh.value / maxVal) * 100;

                return (
                  <tr key={idx} className={`group transition-colors border-b last:border-0 ${isDark ? 'hover:bg-slate-800/20 border-slate-800/50' : 'hover:bg-slate-50/50 border-slate-50/50'}`}>
                    <td className="py-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    </td>
                    <td className={`py-4 font-bold text-xs truncate max-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={sh.shipper}>{sh.shipper}</td>
                    <td className={`py-4 text-right font-black text-xs pr-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>${Math.round(sh.value).toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
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
      <div className={`p-8 rounded-[2rem] shadow-sm overflow-hidden transition-colors duration-300 border ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/20' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <Activity className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Top 10 Shippers By Shipment </h3>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'}`}>Volume Based</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                <th className={`pb-4 text-[10px] font-black uppercase w-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#</th>
                <th className={`pb-4 text-[10px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Shipper</th>
                <th className={`pb-4 text-[10px] font-black uppercase text-right pr-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bills</th>
                <th className={`pb-4 text-[10px] font-black uppercase w-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Intensity</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {topShippersByShipments.map((sh, idx) => {
                const maxCount = topShippersByShipments?.[0]?.count || 1;
                const percentage = (sh.count / totalShipments) * 100;
                const widthPerc = (sh.count / maxCount) * 100;

                return (
                  <tr key={idx} className={`group transition-colors border-b last:border-0 ${isDark ? 'hover:bg-slate-800/20 border-slate-800/50' : 'hover:bg-slate-50/50 border-slate-50/50'}`}>
                    <td className="py-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    </td>
                    <td className={`py-4 font-bold text-xs truncate max-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={sh.shipper}>{sh.shipper}</td>
                    <td className={`py-4 text-right font-black text-xs pr-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{sh.count.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
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
