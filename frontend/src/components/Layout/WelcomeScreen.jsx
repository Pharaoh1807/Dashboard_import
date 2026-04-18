import React from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

const WelcomeScreen = ({ handleUpload, loading, isDark }) => {
  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
      <div className={`max-w-md w-full rounded-[2.5rem] shadow-2xl p-10 text-center transition-all hover:scale-[1.01] border ${isDark ? 'bg-[#1e1e2f] border-slate-800 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner transition-colors ${isDark ? 'bg-slate-800/50' : 'bg-primary-50'}`}>
          <FileSpreadsheet className={`w-12 h-12 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
        </div>
        <h1 className={`text-3xl font-black mb-3 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Import Intelligence</h1>
        <p className={`mb-10 font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Powering your logistics data analysis with automated KPI detection and visual insights.</p>

        <label className={`block w-full border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer group ${isDark ? 'border-slate-700 bg-slate-900/30 hover:border-primary-500/50 hover:bg-slate-800/50' : 'border-slate-200 bg-slate-50 hover:border-primary-400 hover:bg-primary-50' }`}>
          <input type="file" className="hidden" onChange={handleUpload} accept=".xlsx,.xls" />
          <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${isDark ? 'text-slate-600 group-hover:text-primary-400' : 'text-slate-400 group-hover:text-primary-500'}`} />
          <span className={`text-sm font-bold block mb-1 transition-colors ${isDark ? 'text-slate-400 group-hover:text-primary-300' : 'text-slate-600 group-hover:text-primary-700'}`}>Drop Excel or browse files</span>
          <span className={`block text-xs transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Standard .xlsx, .xls formatted files</span>
        </label>

        {loading && (
          <div className={`mt-8 flex items-center justify-center gap-3 font-black animate-pulse ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
            <div className={`animate-spin rounded-full h-5 w-5 border-2 border-t-transparent ${isDark ? 'border-primary-400' : 'border-primary-600'}`}></div>
            Analyzing Data Stream...
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
