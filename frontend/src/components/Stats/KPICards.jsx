import React from 'react';
import {
  Activity,
  Globe,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';

const KPICards = ({ kpis }) => {
  const kpiData = [
    {
      label: 'Total Value',
      value: kpis?.totalValue >= 1e9 
        ? `$${(kpis.totalValue / 1e9).toFixed(2)}B`
        : kpis?.totalValue >= 1e6
        ? `$${(kpis.totalValue / 1e6).toFixed(2)}M`
        : `$${(kpis?.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-primary-500',
      percentage: 'Primary Value Indicator'
    },
    {
      label: 'Total Shipment',
      value: (kpis?.totalShipments || 0).toLocaleString(),
      icon: Activity,
      color: 'bg-indigo-500',
      percentage: 'Total Processed Bill Numbers'
    },
    {
      label: 'Operational Scale',
      value: (kpis?.totalShippers || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      percentage: 'Unique Active Suppliers'
    },
    {
      label: 'Total Conts',
      value: (kpis?.totalContainers || 0).toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      percentage: 'Total Capacity (CBM/Cont)'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {kpiData.map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl ${item.color} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{item.value}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary-500 transition-colors uppercase tracking-tight">
              {item.percentage}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
