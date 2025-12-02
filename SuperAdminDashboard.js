import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Landmark, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { StatCard, Badge, DataTable, Modal } from '../../common';
import { platformAnalytics, demoTenants } from '../../../data/mockData';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SuperAdminDashboard = () => {
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { 
      icon: DollarSign, 
      label: 'Total Capital Deployed', 
      value: `$${(platformAnalytics.totalCapitalDeployed / 1000000).toFixed(1)}M`,
      trend: 18.5,
      color: 'blue'
    },
    { 
      icon: Building2, 
      label: 'Active Investors', 
      value: platformAnalytics.totalInvestors.toString(),
      subValue: '3 active, 1 pending',
      color: 'purple'
    },
    { 
      icon: Landmark, 
      label: 'Partner Banks', 
      value: platformAnalytics.totalBanks.toString(),
      subValue: '3 active, 1 suspended',
      color: 'green'
    },
    { 
      icon: Activity, 
      label: 'Active Mobile Loans', 
      value: platformAnalytics.totalActiveLoans.toLocaleString(),
      trend: 12.1,
      color: 'yellow'
    },
    { 
      icon: TrendingUp, 
      label: 'Platform Yield', 
      value: `${platformAnalytics.avgPlatformYield}%`,
      subValue: 'avg. monthly',
      color: 'pink'
    },
    { 
      icon: DollarSign, 
      label: 'Monthly Revenue', 
      value: `$${(platformAnalytics.monthlyRevenue / 1000).toFixed(0)}K`,
      trend: platformAnalytics.monthlyGrowth,
      color: 'indigo'
    },
  ];

  const investorColumns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      </div>
    )},
    { header: 'Type', accessor: 'type', render: (row) => (
      <Badge variant="purple">{row.type.replace(/_/g, ' ')}</Badge>
    )},
    { header: 'Total Invested', accessor: 'totalInvested', render: (row) => (
      <span className="font-medium">${(row.totalInvested / 1000000).toFixed(1)}M</span>
    )},
    { header: 'Avg Yield', accessor: 'avgYield', render: (row) => (
      <span className="text-green-600">{row.avgYield}%</span>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status}</Badge>
    )},
    { header: '', accessor: 'actions', render: () => (
      <button className="p-1 hover:bg-gray-100 rounded">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    )},
  ];

  const bankColumns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Landmark className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.country}</p>
        </div>
      </div>
    )},
    { header: 'Type', accessor: 'type', render: (row) => (
      <Badge variant="info">{row.type.replace(/_/g, ' ')}</Badge>
    )},
    { header: 'Capital', accessor: 'totalCapital', render: (row) => (
      <span className="font-medium">${(row.totalCapital / 1000000).toFixed(1)}M</span>
    )},
    { header: 'Active Loans', accessor: 'activeLoans', render: (row) => (
      <span>{row.activeLoans.toLocaleString()}</span>
    )},
    { header: 'Monthly Yield', accessor: 'monthlyYield', render: (row) => (
      <span className="text-green-600">{row.monthlyYield}%</span>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'danger' : 'warning'}>
        {row.status}
      </Badge>
    )},
    { header: '', accessor: 'actions', render: () => (
      <button className="p-1 hover:bg-gray-100 rounded">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    )},
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor platform performance and manage tenants</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={() => setShowCreateTenant(true)}
            className="btn-primary flex items-center gap-2 !py-2.5"
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Capital Deployed</h3>
            <select className="text-sm border-0 text-gray-500 focus:ring-0">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={platformAnalytics.capitalByMonth}>
              <defs>
                <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(val) => [`$${(val / 1000000).toFixed(2)}M`, 'Capital']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="capital" 
                stroke="#6366f1" 
                strokeWidth={2}
                fill="url(#capitalGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Monthly Revenue</h3>
            <span className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +{platformAnalytics.monthlyGrowth}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={platformAnalytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('investors')}
            className={`nav-tab ${activeTab === 'investors' ? 'active' : ''}`}
          >
            Investors ({demoTenants.investors.length})
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`nav-tab ${activeTab === 'banks' ? 'active' : ''}`}
          >
            Banks ({demoTenants.banks.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Investors */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Investors</h3>
              <Link to="/admin/investors" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <DataTable 
              columns={investorColumns.slice(0, 4)} 
              data={demoTenants.investors.slice(0, 3)} 
            />
          </div>

          {/* Recent Banks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Partner Banks</h3>
              <Link to="/admin/banks" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <DataTable 
              columns={bankColumns.slice(0, 4)} 
              data={demoTenants.banks.slice(0, 3)} 
            />
          </div>
        </div>
      )}

      {activeTab === 'investors' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search investors..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2 !py-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button 
                onClick={() => setShowCreateTenant(true)}
                className="btn-primary flex items-center gap-2 !py-2"
              >
                <Plus className="w-4 h-4" />
                Add Investor
              </button>
            </div>
          </div>
          <DataTable columns={investorColumns} data={demoTenants.investors} />
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search banks..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2 !py-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button 
                onClick={() => setShowCreateTenant(true)}
                className="btn-primary flex items-center gap-2 !py-2"
              >
                <Plus className="w-4 h-4" />
                Add Bank
              </button>
            </div>
          </div>
          <DataTable columns={bankColumns} data={demoTenants.banks} />
        </div>
      )}

      {/* Create Tenant Modal */}
      <Modal 
        isOpen={showCreateTenant} 
        onClose={() => setShowCreateTenant(false)}
        title="Add New Tenant"
        size="large"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Type</label>
            <select className="select-field">
              <option value="">Select type</option>
              <option value="investor">Investor</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input type="text" className="input-field" placeholder="Enter organization name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@organization.com" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setShowCreateTenant(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary">
              Create Tenant
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
