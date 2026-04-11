import React from 'react';
import { Search } from 'lucide-react';

const AuditLogTable = ({ filteredTableData, tableColumnFilters, setTableColumnFilters, displayColumns }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-10 border-b border-slate-50 bg-[#f9fafb] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audit Session Ledger</h3>
          <p className="text-slate-500 font-medium text-sm">Reviewing individual records for accuracy and compliance.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{filteredTableData.length} records in current view</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
          <thead>
            <tr className="bg-slate-50/50">
              {displayColumns.map(col => (
                <th key={col.key} className="px-8 py-6">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">{col.label}</span>
                  <input
                    type="text"
                    placeholder={`Filter ${col.label}...`}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                    value={tableColumnFilters[col.key] || ''}
                    onChange={(e) => setTableColumnFilters(f => ({ ...f, [col.key]: e.target.value }))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-primary-50/20 transition-all transition-colors group">
                <td className="px-8 py-6 font-bold text-slate-900 text-xs truncate border-l-[3px] border-transparent group-hover:border-primary-500 transition-all">{row.bill_number}</td>
                <td className="px-8 py-6 text-slate-600 text-xs font-semibold">{row.customs_dp || '---'}</td>
                <td className="px-8 py-6 text-slate-600 text-xs font-bold truncate">{row.shipper}</td>
                <td className="px-8 py-6 text-slate-600 text-xs font-medium">{row.declaration_number || '---'}</td>
                <td className="px-8 py-6 text-slate-400 text-[10px]">{row.declaration_date || '---'}</td>
                <td className="px-8 py-6 text-slate-500 text-xs italic truncate" title={row.description}>{row.description || 'No description'}</td>
                <td className="px-8 py-6 font-bold text-slate-600 text-xs">{(row.quantity || 0).toLocaleString()}</td>
                <td className="px-8 py-6 text-primary-600 font-black text-right text-sm">
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
