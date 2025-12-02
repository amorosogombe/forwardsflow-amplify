import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  MapPin,
  DollarSign,
  PieChart,
  Briefcase,
  ArrowUpRight,
  Eye,
  ChevronRight
} from 'lucide-react';
import { StatCard, Badge, Modal } from '../../common';
import { useAuth } from '../../../context/AuthContext';
import { demoInstruments, investorAnalytics } from '../../../data/mockData';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';

// Investment Opportunity Card Component
const InvestmentOpportunityCard = ({ instrument, onInvest }) => {
  const fundingPercentage = instrument.subscribedPct || 
    Math.round((instrument.subscribed / instrument.principal) * 100);
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-card transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {instrument.bankName} - {instrument.type}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {instrument.bankName} • {instrument.currencyPair.split(':')[0] === 'KES' ? 'Kenya' : 
              instrument.currencyPair.split(':')[0] === 'TZS' ? 'Tanzania' : 'Rwanda'}
          </p>
        </div>
        <Badge variant={instrument.status === 'open' ? 'success' : 
          instrument.status === 'fully_subscribed' ? 'purple' : 'warning'}>
          {instrument.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500">Target Yield</p>
          <p className="text-2xl font-bold text-primary-600">{instrument.projectedYield}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Term</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((new Date(instrument.maturityDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))} months
          </p>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Funding Progress</span>
          <span className="text-sm font-medium text-gray-900">{fundingPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${fundingPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>¥{instrument.subscribed.toLocaleString()}</span>
          <span>¥{instrument.principal.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Min. Investment</p>
          <p className="font-semibold text-gray-900">¥{(instrument.principal * 0.1).toLocaleString()}</p>
        </div>
        <button 
          onClick={() => onInvest(instrument)}
          className="btn-primary !py-2.5 !px-6"
          disabled={instrument.status === 'fully_subscribed'}
        >
          Invest Now
        </button>
      </div>
    </div>
  );
};

// Portfolio Summary Card
const PortfolioSummaryCard = ({ analytics }) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={analytics.portfolioByBank}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="amount"
              >
                {analytics.portfolioByBank.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsPie>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {analytics.portfolioByBank.map((bank, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{bank.bank}</span>
              </div>
              <span className="text-sm font-medium">${(bank.amount / 1000000).toFixed(1)}M</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InvestorUserDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [investAmount, setInvestAmount] = useState('');

  const analytics = investorAnalytics['inv-001'];

  const handleInvest = (instrument) => {
    setSelectedInstrument(instrument);
    setShowInvestModal(true);
  };

  const filteredInstruments = demoInstruments.filter(inst =>
    inst.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { 
      icon: DollarSign, 
      label: 'Total Invested', 
      value: `$${(analytics.totalInvested / 1000000).toFixed(1)}M`,
      trend: analytics.portfolioGrowth,
      color: 'blue'
    },
    { 
      icon: Briefcase, 
      label: 'Active Instruments', 
      value: analytics.activeInstruments.toString(),
      subValue: `${analytics.pendingMaturity} maturing soon`,
      color: 'purple'
    },
    { 
      icon: TrendingUp, 
      label: 'Average Yield', 
      value: `${analytics.avgYield}%`,
      trend: 2.1,
      color: 'green'
    },
    { 
      icon: PieChart, 
      label: 'Portfolio Growth', 
      value: `+${analytics.portfolioGrowth}%`,
      subValue: 'YTD',
      color: 'yellow'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Investor'}
        </h1>
        <p className="text-gray-500 mt-1">
          Discover high-yield investment opportunities in frontier markets
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Opportunities - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Investment Opportunities</h2>
            <Link to="/investor/calls" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filters</span>
            </button>
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-4">
            {filteredInstruments.map(instrument => (
              <InvestmentOpportunityCard 
                key={instrument.id} 
                instrument={instrument}
                onInvest={handleInvest}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <PortfolioSummaryCard analytics={analytics} />

          {/* Yield Performance */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Yield Performance</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={analytics.yieldHistory}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Yield']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#yieldGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/investor/calls"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Browse Opportunities</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link 
                to="/investor/puts"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Create Investment Request</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link 
                to="/investor/portfolio"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">View Portfolio</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      <Modal 
        isOpen={showInvestModal} 
        onClose={() => {
          setShowInvestModal(false);
          setSelectedInstrument(null);
          setInvestAmount('');
        }}
        title="Make Investment"
        size="default"
      >
        {selectedInstrument && (
          <div className="space-y-6">
            {/* Instrument Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900">{selectedInstrument.bankName}</h4>
              <p className="text-sm text-gray-500">{selectedInstrument.type}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Target Yield</p>
                  <p className="font-semibold text-primary-600">{selectedInstrument.projectedYield}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Maturity</p>
                  <p className="font-semibold text-gray-900">{selectedInstrument.maturityDate}</p>
                </div>
              </div>
            </div>

            {/* Investment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount ({selectedInstrument.currency})
              </label>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder={`Min. ¥${(selectedInstrument.principal * 0.1).toLocaleString()}`}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">
                Available to invest: ¥{(selectedInstrument.principal - selectedInstrument.subscribed).toLocaleString()}
              </p>
            </div>

            {/* Expected Returns */}
            {investAmount && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-green-800">Expected Annual Return</p>
                <p className="text-2xl font-bold text-green-700">
                  ¥{Math.round(parseFloat(investAmount) * (selectedInstrument.projectedYield / 100)).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Based on {selectedInstrument.projectedYield}% projected yield
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowInvestModal(false);
                  setSelectedInstrument(null);
                  setInvestAmount('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                disabled={!investAmount || parseFloat(investAmount) < selectedInstrument.principal * 0.1}
              >
                Confirm Investment
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvestorUserDashboard;
