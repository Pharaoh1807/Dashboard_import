import React from 'react';
import {
  Search,
  Settings,
  Bell,
  User,
  Zap
} from 'lucide-react';

const Header = ({ lastSync }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between py-6 mb-10 bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200/50 -mx-10 px-10">
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm group focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500" />
          <input
            type="text"
            placeholder="Search Intelligence..."
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-64 placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Operational</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <Zap className="w-4 h-4 text-primary-500" />
          <span className="text-[10px] font-bold text-slate-400">Sync: <span className="text-slate-900">{lastSync}</span></span>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors relative group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
          </button>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-4 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900">Administrator</p>
            <p className="text-[9px] font-bold text-primary-500 uppercase tracking-tighter">System Overseer</p>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
