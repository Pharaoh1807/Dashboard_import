import React from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

const WelcomeScreen = ({ handleUpload, loading }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transition-all hover:scale-[1.01]">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileSpreadsheet className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Intelligence</h1>
        <p className="text-gray-500 mb-8">Powering your logistics data analysis with automated KPI detection.</p>

        <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-10 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group">
          <input type="file" className="hidden" onChange={handleUpload} accept=".xlsx,.xls" />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-primary-500 transition-colors" />
          <span className="text-sm font-medium text-gray-600 group-hover:text-primary-700">Drop Excel or browse files</span>
          <span className="block text-xs text-gray-400 mt-1">Excel files (.xlsx, .xls) only</span>
        </label>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-primary-600 font-bold animate-pulse">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
            Analyzing data...
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
