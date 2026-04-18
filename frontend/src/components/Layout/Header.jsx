import React from 'react';
import {
  Search,
  Settings,
  Bell,
  Zap,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ lastSync, isDark, toggleTheme }) => {
  const { user } = useAuth();

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between py-5 backdrop-blur-md border-b px-10 transition-all duration-500 ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900'}`}>
      <div className="flex items-center gap-6">
        <div className={`hidden lg:flex items-center gap-3 px-6 py-2.5 rounded-2xl border shadow-sm group focus-within:ring-2 transition-all ${isDark ? 'bg-slate-950 border-slate-800 focus-within:ring-primary-900/30' : 'bg-white border-slate-100 focus-within:ring-primary-100'}`}>
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500" />
          <input
            type="text"
            placeholder="Search records..."
            className={`bg-transparent border-none outline-none text-xs font-bold w-64 placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-600'}`}
          />
        </div>
        
        <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live Data Stream</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-300 group hover:scale-110 active:scale-95 ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400 shadow-lg shadow-amber-900/20' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm'}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={20} fill="currentColor" /> : <Moon size={20} />}
            </button>
            <div className={`w-px h-6 mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden md:flex">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.role || 'Guest'}</span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user?.username || 'User Account'}</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border text-primary-500 shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-primary-50 border-primary-100'}`}>
             <Zap size={24} fill="currentColor" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
