import React from 'react';
import { Search } from 'lucide-react';

const AuditLogTable = ({ filteredTableData, tableColumnFilters, setTableColumnFilters, displayColumns, isDark }) => {
  return (
    <div className={`rounded-[2.5rem] shadow-xl overflow-hidden transition-colors duration-300 border ${isDark ? 'bg-[#1e1e2f] border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className={`p-10 border-b transition-colors duration-300 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-[#f9fafb]'} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div>
          <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Audit Session Ledger</h3>
          <p className={`font-medium text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reviewing individual records for accuracy and compliance.</p>
        </div>
        <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <Search className="w-4 h-4 text-slate-400" />
          <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{filteredTableData.length} records in current view</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
          <thead>
            <tr className={`transition-colors ${isDark ? 'bg-slate-900/80' : 'bg-slate-50/50'}`}>
              {displayColumns.map(col => (
                <th key={col.key} className="px-8 py-6">
                  <span className={`text-[10px] font-black uppercase mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{col.label}</span>
                  <input
                    type="text"
                    placeholder={`Filter ${col.label}...`}
                    className={`w-full border rounded-lg py-1.5 px-3 text-[10px] outline-none font-medium transition-all focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300'}`}
                    value={tableColumnFilters[col.key] || ''}
                    onChange={(e) => setTableColumnFilters(f => ({ ...f, [col.key]: e.target.value }))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {filteredTableData.map((row, idx) => (
              <tr key={idx} className={`transition-all transition-colors group ${isDark ? 'hover:bg-primary-900/10' : 'hover:bg-primary-50/20'}`}>
                <td className={`px-8 py-6 font-bold text-xs truncate border-l-[3px] border-transparent group-hover:border-primary-500 transition-all ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{row.bill_number}</td>
                <td className={`px-8 py-6 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.customs_dp || '---'}</td>
                <td className={`px-8 py-6 text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.shipper}</td>
                <td className={`px-8 py-6 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.declaration_number || '---'}</td>
                <td className={`px-8 py-6 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{row.declaration_date || '---'}</td>
                <td className={`px-8 py-6 text-xs italic truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={row.description}>{row.description || 'No description'}</td>
                <td className={`px-8 py-6 font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{(row.quantity || 0).toLocaleString()}</td>
                <td className={`px-8 py-6 font-black text-right text-sm ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                  ${(row.value || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogTable;
