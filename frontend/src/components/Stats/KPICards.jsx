import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Ship,
  Factory,
  Package,
  Receipt
} from 'lucide-react';

const KPICards = ({ kpis, isDark }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatValue = (val, isCurrency = false, isVnd = false) => {
    if (val === undefined || val === null) return '0';
    
    if (isCurrency) {
      if (isVnd) {
        // Vietnamese Currency Formatting (Tỷ / Tr)
        if (Math.abs(val) >= 1e9) {
          return (val / 1e9).toFixed(2) + ' Tỷ';
        } else if (Math.abs(val) >= 1e6) {
          return (val / 1e6).toFixed(0) + ' Tr';
        }
        return val.toLocaleString();
      }
      // USD Currency Formatting
      return (val / 1e6).toFixed(2) + 'M';
    }
    return val.toLocaleString();
  };

  const kpiData = [
    {
      label: 'TOTAL VALUE',
      value: formatValue(kpis?.totalValue, true, false),
      unit: 'USD',
      icon: DollarSign,
      color: isDark ? 'text-emerald-400' : 'text-emerald-600',
      bgIcon: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      glow: 'shadow-emerald-500/20',
      tooltip: 'Tổng trị giá khai báo USD'
    },
    {
      label: 'SHIPMENTS',
      value: formatValue(kpis?.totalShipments),
      unit: 'Units',
      icon: Ship,
      color: isDark ? 'text-blue-400' : 'text-blue-600',
      bgIcon: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      glow: 'shadow-blue-500/20',
      tooltip: 'Tổng số lô hàng đã xử lý'
    },
    {
      label: 'SUPPLIERS',
      value: formatValue(kpis?.totalShippers),
      unit: 'Active',
      icon: Factory,
      color: isDark ? 'text-violet-400' : 'text-violet-600',
      bgIcon: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
      glow: 'shadow-violet-500/20',
      tooltip: 'Số lượng nhà cung cấp duy nhất'
    },
    {
      label: 'CONTAINERS',
      value: formatValue(kpis?.totalContainers),
      unit: 'Cont',
      icon: Package,
      color: isDark ? 'text-amber-400' : 'text-amber-600',
      bgIcon: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      glow: 'shadow-amber-500/20',
      tooltip: 'Tổng số lượng Container / CBM'
    },
    {
      label: 'IMPORT TAX',
      value: formatValue(kpis?.totalImportTax, true, true),
      unit: 'VND',
      icon: Receipt,
      color: isDark ? 'text-rose-400' : 'text-rose-600',
      bgIcon: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
      glow: 'shadow-rose-500/20',
      tooltip: 'Tổng tiền thuế nhập khẩu (Tỷ/Tr VNĐ)'
    },
    {
      label: 'VAT TAX',
      value: formatValue(kpis?.totalVat, true, true),
      unit: 'VND',
      icon: Receipt,
      color: isDark ? 'text-fuchsia-400' : 'text-fuchsia-600',
      bgIcon: isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-50',
      glow: 'shadow-fuchsia-500/20',
      tooltip: 'Tổng tiền thuế GTGT (Tỷ/Tr VNĐ)'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
      {kpiData.map((item, index) => (
        <div
          key={index}
          title={item.tooltip}
          className={`group flex flex-col p-4 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
            isDark 
              ? 'bg-[#1e1e2f]/80 border-slate-800 backdrop-blur-md shadow-black/20 hover:shadow-primary-500/10' 
              : 'bg-white border-slate-100 shadow-sm hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl transition-all duration-500 ${item.bgIcon} ${isDark ? item.glow : ''}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <span className={`text-[9px] font-black tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.unit}
            </span>
          </div>
          
          <div>
            <p className={`text-[9px] font-black tracking-widest uppercase mb-1 opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
