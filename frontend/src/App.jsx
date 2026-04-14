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
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setData(null);
    setFilters({ shipper: [], origins: [], years: [], dateRange: [null, null] });
    setTableColumnFilters({});

    try {
      const response = await axios.post('/api/upload', formData);
      const newFileId = response.data.fileId;
      setFileId(newFileId);
      localStorage.setItem(`dashboard_file_id_${user.id}`, newFileId);
      await fetchDashboardData(newFileId);
      await fetchFilterOptions(newFileId);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please check the file format.");
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

  const fetchFilterOptions = async (id) => {
    try {
      const response = await axios.get(`/api/filters/${id}`);
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
      fetchFilterOptions(savedFileId);
    }
  }, [user]);

  useEffect(() => {
    if (fileId) {
      fetchDashboardData(fileId);
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
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Account Pending Approval</h1>
          <p className="text-slate-500 mb-8 font-medium">Your account has been created successfully, but it requires manual approval by an administrator before you can access the dashboard. Please contact your administrator for more information.</p>
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2 mx-auto"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden">
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
      />
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ${isSidebarHovered ? 'ml-64' : 'ml-24'}`}>
        <Header lastSync={lastSync} />
        
        <main className="flex-1 overflow-y-auto p-10 pt-2">
          {!fileId && activeTab !== 'admin' ? (
            <WelcomeScreen handleUpload={handleUpload} loading={loading} />
          ) : activeTab === 'dashboard' ? (
            <>
              <KPICards kpis={data?.kpis} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
                <SupplierDynamics data={data} />

                <div className="flex flex-col gap-10">
                  <VolumeChart data={data} />
                  <OriginsDistribution data={data} />
                </div>
              </div>

              <TopShippersTables data={data} />
            </>
          ) : activeTab === 'admin' ? (
            <UserControl />
          ) : (
            <AuditLogTable
              filteredTableData={filteredTableData}
              tableColumnFilters={tableColumnFilters}
              setTableColumnFilters={setTableColumnFilters}
              displayColumns={displayColumns}
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
