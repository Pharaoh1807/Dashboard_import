import React from 'react';
import {
  LayoutDashboard,
  Database,
  Download,
  LogOut,
  Filter,
  BarChart2,
  Users,
  ShieldCheck,
  FileUp,
  Trash2
} from 'lucide-react';
import logo from '../../../logo.svg';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({
  isExpanded,
  setIsSidebarHovered,
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  filterOptions,
  onClearFile,
  onTerminate,
  onLogout,
  fileId,
  isDark
}) => {
  const { user } = useAuth();

  return (
    <aside
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      className={`fixed inset-y-0 z-50 flex flex-col shadow-2xl transition-all duration-500 ease-in-out overflow-y-auto overflow-x-hidden border-r
        ${isExpanded ? 'w-72' : 'w-24'}
        ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}
      `}
    >
      {/* Background Gradient Effect for Dark Mode */}
      {isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none"></div>
      )}

      <div className="p-6 flex flex-col min-h-full relative z-10">
        <div className="flex items-center gap-4 mb-10 h-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 scale-90 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
            <img src={logo} alt="Pharaoh Logo" className="w-8 h-8" />
          </div>
          {isExpanded && (
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <h1 className="text-2xl font-black tracking-tighter leading-none italic bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">PHARAOH</h1>
              <p className="text-[10px] font-black text-primary-500 tracking-[0.3em] mt-1 uppercase drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Analysis Automatic</p>
            </div>
          )}
        </div>

        {/* User Info Section */}
        {isExpanded && (
          <div className={`mb-8 p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-inner' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${isDark ? 'bg-slate-800 text-primary-400 border border-slate-700' : 'bg-white text-primary-600 border border-slate-200'}`}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.username}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" />}
                  {user?.role} Access
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-3 flex-shrink-0">
          {fileId && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/40 translate-x-1' : (isDark ? 'text-slate-500 hover:bg-slate-900 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900')}`}
              >
                <LayoutDashboard className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">Dashboard</span>}
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'table' ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/40 translate-x-1' : (isDark ? 'text-slate-500 hover:bg-slate-900 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900')}`}
              >
                <Database className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === 'table' ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">Audit Ledger</span>}
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/40 translate-x-1' : (isDark ? 'text-slate-500 hover:bg-slate-900 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900')}`}
            >
              <Users className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === 'admin' ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">Management</span>}
            </button>
          )}
        </nav>

        {/* Persistent Sidebar Filters */}
        {fileId && (
          <div className={`mt-10 pt-8 border-t transition-all duration-700 ${isDark ? 'border-slate-900' : 'border-slate-50'} ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className={`p-2 rounded-xl shadow-sm ${isDark ? 'bg-slate-900 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                <Filter className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Engine Filters</span>
            </div>

            <div className="space-y-6 px-1">
              <div>
                <label className={`text-[10px] font-black uppercase block mb-2 ml-1 tracking-wider ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>Supplier</label>
                <select
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer appearance-none ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300 focus:border-primary-500' : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-primary-400'}`}
                  value={filters.shipper?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, shipper: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Global Suppliers</option>
                  {(filterOptions.shipper || []).map(ship => (
                    <option key={ship} value={ship}>{ship}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase block mb-2 ml-1 tracking-wider ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>Geography</label>
                <select
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer appearance-none ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300 focus:border-primary-500' : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-primary-400'}`}
                  value={filters.origins?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, origins: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Global Origins</option>
                  {(filterOptions.origins || []).map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase block mb-2 ml-1 tracking-wider ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>Fiscal Year</label>
                <select
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer appearance-none ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300 focus:border-primary-500' : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-primary-400'}`}
                  value={filters.years?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, years: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Full History</option>
                  {(filterOptions.years || []).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-10 space-y-3">
          <button
            onClick={onClearFile}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-transparent shadow-sm ${isDark ? 'text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/20' : 'text-primary-600 hover:bg-primary-50 hover:border-primary-100'}`}
          >
            <FileUp className="w-5 h-5 flex-shrink-0 group-hover:-translate-y-1 transition-transform" />
            {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">New File Upload</span>}
          </button>

          <button
            onClick={onTerminate}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-transparent shadow-sm ${isDark ? 'text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20' : 'text-amber-600 hover:bg-amber-50 hover:border-amber-100'}`}
          >
            <Trash2 className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">Terminate File</span>}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-transparent shadow-sm ${isDark ? 'text-red-400 hover:bg-red-500/10 hover:border-red-500/20' : 'text-red-600 hover:bg-red-50 hover:border-red-100'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
            {isExpanded && <span className="text-sm font-black tracking-tight whitespace-nowrap">Log Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
