import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import WelcomeScreen from './components/Layout/WelcomeScreen';
import AuthScreen from './pages/AuthScreen';
import { useAuth } from './context/AuthContext';

// Stats & Charts
import KPICards from './components/Stats/KPICards';
import SupplierDynamics from './components/Charts/SupplierDynamics';
import VolumeChart from './components/Charts/VolumeChart';
import OriginsDistribution from './components/Charts/OriginsDistribution';

// Tables
import TopShippersTables from './components/Tables/TopShippersTables';
import AuditLogTable from './components/Tables/AuditLogTable';
import UserControl from './components/Admin/UserControl';
import { ShieldCheck, LogOut } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Boundary caught error", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 m-8">
          <h2 className="text-xl font-bold text-red-700">Something went wrong.</h2>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { user, logout } = useAuth();
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [lastSync, setLastSync] = useState('Never');
  
  // New states for sheet selection
  const [availableSheets, setAvailableSheets] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing data...");

  // Theme management
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const [filters, setFilters] = useState({
    shipper: [],
    origins: [],
    years: [],
    dateRange: [null, null]
  });

  const [tableColumnFilters, setTableColumnFilters] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    shipper: [],
    origins: [],
    pod: [],
    years: []
  });

  const handleUpload = async (e) => {
    const file = e?.target?.files?.[0] || pendingFile;
    if (!file) return;

    setLoading(true);
    setLoadingMessage("Checking file sheets...");
    
    // If we're selecting a sheet, we already cleared these. 
    // If it's a new upload, we clear them.
    if (e?.target?.files?.[0]) {
      setData(null);
      setFilters({ shipper: [], origins: [], years: [], dateRange: [null, null] });
      setTableColumnFilters({});
      setPendingFile(file);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // If we don't have a sheet name yet, we just inspect the file
      const response = await axios.post('/api/upload', formData);
      
      if (response.data.sheets) {
        setAvailableSheets(response.data.sheets);
        setShowSheetSelector(true);
        setLoading(false);
        return;
      }

      const newFileId = response.data.fileId;
      setFileId(newFileId);
      localStorage.setItem(`dashboard_file_id_${user.id}`, newFileId);
      await fetchDashboardData(newFileId);
      await fetchFilterOptions(newFileId);
      setShowSheetSelector(false);
      setPendingFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed: " + (error.response?.data?.detail || "Please check the file format."));
    } finally {
      setLoading(false);
    }
  };

  const handleSheetSelect = async (sheetName) => {
    setLoading(true);
    setLoadingMessage(`Processing sheet: ${sheetName}...`);
    const formData = new FormData();
    formData.append('file', pendingFile);

    try {
      const response = await axios.post(`/api/upload?sheet_name=${encodeURIComponent(sheetName)}`, formData);
      const newFileId = response.data.fileId;
      setFileId(newFileId);
      localStorage.setItem(`dashboard_file_id_${user.id}`, newFileId);
      await fetchDashboardData(newFileId);
      await fetchFilterOptions(newFileId, filters);
      setShowSheetSelector(false);
      setPendingFile(null);
    } catch (error) {
      console.error("Processing sheet failed", error);
      alert("Failed to process selected sheet.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (id, forceRefresh = false) => {
    const cacheKey = `dashboard_data_${id}_${JSON.stringify(filters)}`;

    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
        setLastSync(new Date().toLocaleTimeString());
        return;
      }
    }

    try {
      if (forceRefresh) setLoading(true);
      const response = await axios.get(`/api/dashboard/${id}`, {
        params: filters,
        paramsSerializer: { indexes: null }
      });
      setData(response.data);
      setLastSync(new Date().toLocaleTimeString());
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (e) {
        console.warn("Session storage full, skipped caching");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      if (forceRefresh) setLoading(false);
    }
  };

  const fetchFilterOptions = async (id, currentFilters = {}) => {
    try {
      const response = await axios.get(`/api/filters/${id}`, {
        params: currentFilters,
        paramsSerializer: { indexes: null }
      });
      setFilterOptions({
        shipper: response.data?.shipper || [],
        origins: response.data?.origins || [],
        pod: response.data?.pod || [],
        years: response.data?.years || []
      });
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  };

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    const savedFileId = localStorage.getItem(`dashboard_file_id_${user.id}`);
    if (savedFileId) {
      setFileId(savedFileId);
      fetchDashboardData(savedFileId);
      fetchFilterOptions(savedFileId, filters);
    }
  }, [user]);

  useEffect(() => {
    if (fileId) {
      fetchDashboardData(fileId);
      fetchFilterOptions(fileId, filters);
    }
  }, [filters, fileId]);

  const displayColumns = useMemo(() => [
    { key: 'bill_number', label: 'Số Bill' },
    { key: 'customs_dp', label: 'Customs DP' },
    { key: 'shipper', label: 'Shipper' },
    { key: 'declaration_number', label: 'Số tờ khai' },
    { key: 'declaration_date', label: 'Ngày tờ khai' },
    { key: 'description', label: 'Mô tả' },
    { key: 'quantity', label: 'Số lượng' },
    { key: 'value', label: 'Giá trị' }
  ], []);

  const filteredTableData = useMemo(() => {
    if (!data?.table) return [];
    return data.table.filter(row => {
      return Object.entries(tableColumnFilters).every(([col, val]) => {
        if (!val) return true;
        const cellValue = String(row[col] || '').toLowerCase();
        return cellValue.includes(val.toLowerCase());
      });
    });
  }, [data?.table, tableColumnFilters]);

  const handleClearFile = () => {
    localStorage.removeItem(`dashboard_file_id_${user.id}`);
    setFileId(null);
    setData(null);
    setFilters({ shipper: [], origins: [], years: [], dateRange: [null, null] });
  };

  const handleTerminate = () => {
    sessionStorage.clear();
    handleClearFile();
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <AuthScreen />;
  }

  if (!user.is_approved && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center transition-colors duration-500">
        <div className="max-w-md bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Account Pending Approval</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your account has been created successfully, but it requires manual approval by an administrator before you can access the dashboard. Please contact your administrator for more information.</p>
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2 mx-auto"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors duration-500 ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar
        isExpanded={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onClearFile={handleClearFile}
        onTerminate={handleTerminate}
        onLogout={handleLogout}
        fileId={fileId}
        isDark={isDark}
      />
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ${isSidebarHovered ? 'ml-72' : 'ml-24'}`}>
        <Header lastSync={lastSync} isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-1 overflow-y-auto p-10 pt-2">
          {!fileId && activeTab !== 'admin' ? (
            showSheetSelector ? (
              <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 border border-slate-100 dark:border-slate-800 transition-colors">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Select Excel Sheet</h2>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-800 dark:border-slate-400 border-t-transparent"></div>
                      <p className="font-bold text-slate-600 dark:text-slate-300">{loadingMessage}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3">
                        {availableSheets.map(sheet => (
                          <button
                            key={sheet}
                            onClick={() => handleSheetSelect(sheet)}
                            className="w-full p-4 text-left border border-slate-200 rounded-2xl hover:border-slate-800 hover:bg-slate-50 transition-all font-bold text-slate-700 flex justify-between items-center group"
                          >
                            {sheet}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 text-xs">Select →</span>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setShowSheetSelector(false); setPendingFile(null); }}
                        className="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors w-full text-center"
                      >
                        Cancel upload
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <WelcomeScreen handleUpload={handleUpload} loading={loading} isDark={isDark} />
            )
          ) : activeTab === 'dashboard' ? (
            <>
              <KPICards kpis={data?.kpis} isDark={isDark} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
                <SupplierDynamics data={data} isDark={isDark} />

                <div className="flex flex-col gap-10">
                  <VolumeChart data={data} isDark={isDark} />
                  <OriginsDistribution data={data} isDark={isDark} />
                </div>
              </div>

              <TopShippersTables data={data} isDark={isDark} />
            </>
          ) : activeTab === 'admin' ? (
            <UserControl isDark={isDark} />
          ) : (
            <AuditLogTable
              filteredTableData={filteredTableData}
              tableColumnFilters={tableColumnFilters}
              setTableColumnFilters={setTableColumnFilters}
              displayColumns={displayColumns}
              isDark={isDark}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
