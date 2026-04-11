import React from 'react';
import {
  LayoutDashboard,
  Database,
  Download,
  LogOut,
  Filter,
  BarChart2
} from 'lucide-react';

const Sidebar = ({
  isExpanded,
  setIsSidebarHovered,
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  filterOptions,
  onLogout
}) => {
  return (
    <aside
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      className={`bg-slate-900 text-white flex flex-col fixed inset-y-0 shadow-2xl transition-all duration-500 ease-in-out z-50 overflow-y-auto overflow-x-hidden ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      <div className="p-5 flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-4 mb-10 h-10">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          {isExpanded && (
            <div className="animate-in fade-in slide-in-from-left duration-500 overflow-hidden">
              <h1 className="text-xl font-black tracking-tighter leading-none">PHARAOH</h1>
              <p className="text-[10px] font-bold text-primary-400 tracking-[0.2em] mt-1 uppercase">Intelligence</p>
            </div>
          )}
        </div>

        <nav className="space-y-3 flex-1 overflow-hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'}`} />
            {isExpanded && <span className="text-sm font-bold tracking-tight whitespace-nowrap">Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'table' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Database className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === 'table' ? 'scale-110' : 'group-hover:scale-110'}`} />
            {isExpanded && <span className="text-sm font-bold tracking-tight whitespace-nowrap">Audit Ledger</span>}
          </button>
        </nav>

        {/* Persistent Sidebar Filters */}
        <div className={`mt-8 pt-8 border-t border-slate-800 transition-all duration-500 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="p-1.5 bg-slate-800 rounded-lg">
              <Filter className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quick Filters</span>
          </div>
          
          <div className="space-y-6 px-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 ml-1">Supplier</label>
              <select
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                onChange={(e) => setFilters(prev => ({ ...prev, shipper: e.target.value ? [e.target.value] : [] }))}
              >
                <option value="">All Suppliers</option>
                {(filterOptions.shipper || []).map(ship => (
                  <option key={ship} value={ship}>{ship}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 ml-1">Geography</label>
              <select
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                onChange={(e) => setFilters(prev => ({ ...prev, origins: e.target.value ? [e.target.value] : [] }))}
              >
                <option value="">All Origins</option>
                {(filterOptions.origins || []).map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 ml-1">Fiscal Year</label>
              <select
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                onChange={(e) => setFilters(prev => ({ ...prev, years: e.target.value ? [e.target.value] : [] }))}
              >
                <option value="">All Time</option>
                {(filterOptions.years || []).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={() => {
              const fileId = localStorage.getItem('fileId');
              if (fileId) window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/export/${fileId}`, '_blank');
            }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <Download className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {isExpanded && <span className="text-sm font-bold tracking-tight whitespace-nowrap">Export Intelligence</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
            {isExpanded && <span className="text-sm font-bold tracking-tight whitespace-nowrap">Terminate Session</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
