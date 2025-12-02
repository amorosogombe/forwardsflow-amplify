import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Phone, 
  TrendingUp, 
  BarChart3,
  Users,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { StatCard, Badge, DataTable, Modal } from '../../common';
import { useAuth } from '../../../context/AuthContext';
import { bankAnalytics, demoLoans, demoInstruments } from '../../../data/mockData';
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
  AreaChart,
  Area
} from 'recharts';

// Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, to, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Link 
      to={to}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-card transition-all"
    >
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
};

// Loan Application Card
const LoanApplicationCard = ({ loan }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Phone className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{loan.borrowerName}</p>
          <p className="text-sm text-gray-500">{loan.borrowerPhone}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">KES {loan.amount.toLocaleString()}</p>
        <p className="text-xs text-gray-500">{loan.term} days</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
          Approve
        </button>
        <button className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-lg border hover:bg-gray-50">
          Review
        </button>
      </div>
    </div>
  );
};

const BankAdminDashboard = () => {
  const { user } = useAuth();
  const [showCreateInstrument, setShowCreateInstrument] = useState(false);
  
  const analytics = bankAnalytics['bank-001'];
  
  // Format currency with Yen symbol
  const formatYen = (value) => `¥${value.toLocaleString()}`;
  
  const stats = [
    { 
      icon: DollarSign, 
      label: 'Total Capital', 
      value: formatYen(analytics.totalCapital),
      color: 'blue'
    },
    { 
      icon: Phone, 
      label: 'Active Mobile Loans', 
      value: analytics.activeLoans.toString(),
      color: 'green'
    },
    { 
      icon: TrendingUp, 
      label: 'Mobile Loans Volume', 
      value: formatYen(analytics.loanVolume),
      color: 'purple'
    },
    { 
      icon: BarChart3, 
      label: 'Monthly Yield', 
      value: `${analytics.monthlyYield}%`,
      color: 'yellow'
    },
  ];

  const loanStatusData = analytics.loanStatusDistribution;
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const instrumentColumns = [
    { header: 'Type', accessor: 'type', render: (row) => (
      <span className="font-medium text-gray-900">{row.type}</span>
    )},
    { header: 'Currency', accessor: 'currencyPair' },
    { header: 'Principal', accessor: 'principal', render: (row) => (
      <span>¥{row.principal.toLocaleString()}</span>
    )},
    { header: 'Rate', accessor: 'interestRate', render: (row) => (
      <span className="text-green-600">{row.interestRate}%</span>
    )},
    { header: 'Subscribed', accessor: 'subscribedPct', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${row.subscribedPct}%` }}
          />
        </div>
        <span className="text-sm">{row.subscribedPct}%</span>
      </div>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'open' ? 'success' : row.status === 'fully_subscribed' ? 'purple' : 'warning'}>
        {row.status.replace('_', ' ')}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Overview</h1>
          <p className="text-gray-500 mt-1">Monitor your bank's performance and mobile lending operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={() => setShowCreateInstrument(true)}
            className="btn-primary flex items-center gap-2 !py-2.5"
          >
            <Plus className="w-4 h-4" />
            Create Call
          </button>
        </div>
      </div>

      {/* Stats Grid - Matching the screenshot layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Disbursements Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Weekly Disbursements</h3>
            <select className="text-sm border-0 text-gray-500 focus:ring-0 bg-transparent">
              <option>This Week</option>
              <option>Last Week</option>
              <option>Last Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.weeklyDisbursements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(val) => `¥${(val / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(val) => [`¥${val.toLocaleString()}`, 'Disbursed']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Portfolio Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-6">Loan Portfolio Status</h3>
          <div className="flex items-center justify-center mb-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {loanStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="text-sm text-gray-600">{item.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-400 ml-1">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">NPL Rate</span>
              <span className="text-lg font-bold text-red-600">{analytics.nplRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard 
          icon={Plus}
          title="Create Call"
          description="New deposit instrument"
          to="/bank/admin/instruments"
          color="blue"
        />
        <QuickActionCard 
          icon={Phone}
          title="Loan Applications"
          description={`${analytics.disbursementsToday} pending today`}
          to="/bank/admin/lending"
          color="green"
        />
        <QuickActionCard 
          icon={BarChart3}
          title="Analytics"
          description="View detailed reports"
          to="/bank/admin/analytics"
          color="purple"
        />
        <QuickActionCard 
          icon={Users}
          title="User Management"
          description="Manage bank staff"
          to="/bank/admin/users"
          color="yellow"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Instruments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Instruments</h3>
            <Link to="/bank/admin/instruments" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <DataTable 
            columns={instrumentColumns.slice(0, 4)} 
            data={demoInstruments.filter(i => i.bankId === 'bank-001').slice(0, 3)} 
          />
        </div>

        {/* Recent Loan Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Loan Applications</h3>
            <Link to="/bank/admin/lending" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {demoLoans.slice(0, 3).map(loan => (
              <LoanApplicationCard key={loan.id} loan={loan} />
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Disbursements Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.disbursementsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Collections Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.collectionsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Loan Size</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {analytics.avgLoanSize.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
      </div>

      {/* Create Instrument Modal */}
      <Modal 
        isOpen={showCreateInstrument} 
        onClose={() => setShowCreateInstrument(false)}
        title="Create New Deposit Instrument"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instrument Type</label>
              <select className="select-field">
                <option value="">Select type</option>
                <option value="fixed_deposit">Fixed Deposit</option>
                <option value="time_deposit">Time Deposit</option>
                <option value="cd">Certificate of Deposit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency Pair</label>
              <select className="select-field">
                <option value="">Select pair</option>
                <option value="KES:JPY">KES:JPY</option>
                <option value="KES:CHF">KES:CHF</option>
                <option value="KES:USD">KES:USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount</label>
              <input type="number" className="input-field" placeholder="e.g., 500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
              <input type="number" className="input-field" placeholder="e.g., 12.5" step="0.1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forwards Premium (%)</label>
              <input type="number" className="input-field" placeholder="e.g., 2.3" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maturity Date</label>
              <input type="date" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intended Use</label>
            <select className="select-field">
              <option value="mobile_lending">Mobile Lending Deployment</option>
              <option value="working_capital">Working Capital</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setShowCreateInstrument(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary">
              Create Instrument
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BankAdminDashboard;
