import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Package,
  Filter,
  LogOut,
  ChevronRight,
  Download,
  Plus,
  ArrowUpRight,
  Search,
  Settings
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Card = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-900">{value ?? '0'}</span>
      {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
    </div>
  </div>
);

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  
  const [filters, setFilters] = useState({
    shipper: [],
    origins: [],
    dateRange: [null, null]
  });
  
  const [tableColumnFilters, setTableColumnFilters] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    shipper: [],
    origins: [],
    pod: []
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setData(null);
    setFilters({ shipper: [], origins: [], dateRange: [null, null] });
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

  const fetchDashboardData = async (id) => {
    try {
      const response = await axios.get(`/api/dashboard/${id}`, { params: filters });
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchFilterOptions = async (id) => {
    try {
      const response = await axios.get(`/api/filters/${id}`);
      setFilterOptions({
        shipper: response.data?.shipper || [],
        origins: response.data?.origins || [],
        pod: response.data?.pod || []
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
      localStorage.setItem('dashboard_file_id', fileId);
    } else {
      localStorage.removeItem('dashboard_file_id');
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) {
      fetchDashboardData(fileId);
    }
  }, [filters]);

  // Specific Columns requested by user
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
  }

  const isExpanded = isSidebarHovered;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Dynamic Collapsible Sidebar */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`bg-slate-900 text-white flex flex-col fixed inset-y-0 shadow-2xl transition-all duration-500 ease-in-out z-50 ${isExpanded ? 'w-64' : 'w-20'}`}
      >
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-10 h-10">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              Pharaoh BI
            </span>
          </div>

          <nav className="space-y-3 flex-1 overflow-hidden">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <BarChart3 className="w-6 h-6 flex-shrink-0" />
              <span className={`transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                Overview
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('raw-data')}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-semibold transition-all ${activeTab === 'raw-data' ? 'bg-primary-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <TableIcon className="w-6 h-6 flex-shrink-0" />
              <span className={`transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                Audit Log
              </span>
            </button>
          </nav>

          <div className="mt-auto space-y-3">
            <button
              onClick={() => {
                setFileId(null);
                localStorage.removeItem('dashboard_file_id');
              }}
              className="group w-full flex items-center gap-4 px-3 py-3 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-6 h-6 flex-shrink-0 group-hover:rotate-180 transition-transform duration-500" />
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Responsive Main Content */}
      <main className={`flex-1 p-10 transition-all duration-500 ${isExpanded ? 'ml-64' : 'ml-24'}`}>
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className="h-14 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                Import Analytics
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 italic">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                Live Tracking Session
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                const url = `/api/export/${fileId}?${new URLSearchParams(filters).toString()}`;
                window.open(url, '_blank');
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setFileId(null)}
              className="flex items-center gap-2 bg-[#1e293b] px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-[#334155] transition-all shadow-xl active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Upload New
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            {/* KPI Section */}
            {data && data.kpis && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <Card title="Traffic Volume" value={data.kpis.totalShipments.toLocaleString()} icon={TrendingUp} trend={8.2} />
                <Card title="Market Value" value={`$${data.kpis.totalValue.toLocaleString()}`} icon={FileSpreadsheet} subtext="USD" />
                <Card title="Supplier Count" value={data.kpis.totalShippers} icon={Users} />
                <Card title="Cargo Weight" value={data.kpis.totalWeight.toLocaleString()} icon={Package} subtext="kg" />
              </div>
            )}

            {/* Charts Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center justify-between">Monthly Logistics Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.charts?.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Total Value']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Economic Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.charts?.originsDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={115}
                        paddingAngle={10}
                        dataKey="value"
                        nameKey="origins"
                        stroke="none"
                      >
                        {(data?.charts?.originsDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Value Share']}
                      />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Global Workspace Filters */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-6 items-center">
              <div className="w-3 h-10 bg-primary-600 rounded-full hidden sm:block"></div>
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Entity Primary</span>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                  onChange={(e) => setFilters(prev => ({ ...prev, shipper: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">All Scopes (Global Shippers)</option>
                  {(filterOptions.shipper || []).map(ship => (
                    <option key={ship} value={ship}>{ship}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Geographic Filter</span>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                  onChange={(e) => setFilters(prev => ({ ...prev, origins: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Global Coverage (All Origins)</option>
                  {(filterOptions.origins || []).map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          /* Structured Log Viewer with Column Filters */
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
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                          value={tableColumnFilters[col.key] || ''}
                          onChange={(e) => setTableColumnFilters(f => ({...f, [col.key]: e.target.value}))}
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
