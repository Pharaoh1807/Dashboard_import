import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import WelcomeScreen from './components/Layout/WelcomeScreen';

// Stats & Charts
import KPICards from './components/Stats/KPICards';
import SupplierDynamics from './components/Charts/SupplierDynamics';
import VolumeChart from './components/Charts/VolumeChart';
import EconomicDistribution from './components/Charts/EconomicDistribution';

// Tables
import TopShippersTables from './components/Tables/TopShippersTables';
import AuditLogTable from './components/Tables/AuditLogTable';

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
      localStorage.setItem('dashboard_file_id', newFileId);
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
    const savedFileId = localStorage.getItem('dashboard_file_id');
    if (savedFileId) {
      setFileId(savedFileId);
      fetchDashboardData(savedFileId);
      fetchFilterOptions(savedFileId);
    }
  }, []);

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

  if (!fileId) {
    return <WelcomeScreen handleUpload={handleUpload} loading={loading} />;
  }

  const handleLogout = () => {
    setFileId(null);
    localStorage.removeItem('dashboard_file_id');
    sessionStorage.clear();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar
        isExpanded={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onLogout={handleLogout}
      />

      <main className={`flex-1 p-10 transition-all duration-500 ${isSidebarHovered ? 'ml-64' : 'ml-24'}`}>
        <Header lastSync={lastSync} />

        {activeTab === 'dashboard' ? (
          <>
            <KPICards kpis={data?.kpis} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
              <SupplierDynamics data={data} />
              
              <div className="flex flex-col gap-10">
                <VolumeChart data={data} />
                <EconomicDistribution data={data} />
              </div>
            </div>

            <TopShippersTables data={data} />
          </>
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
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
