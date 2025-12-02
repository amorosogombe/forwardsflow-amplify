import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { Badge, Modal } from '../../common';
import { demoInstruments, currencies, investmentTerms } from '../../../data/mockData';

// More detailed investment opportunity card matching the screenshot
const OpportunityCard = ({ instrument, onInvest }) => {
  const fundingPercentage = instrument.subscribedPct || 
    Math.round((instrument.subscribed / instrument.principal) * 100);
  
  // Calculate term in months
  const maturityDate = new Date(instrument.maturityDate);
  const today = new Date();
  const termMonths = Math.round((maturityDate - today) / (1000 * 60 * 60 * 24 * 30));
  
  // Determine country from currency pair
  const getCountry = (currencyPair) => {
    const base = currencyPair.split(':')[0];
    const countryMap = {
      'KES': 'Kenya',
      'TZS': 'Tanzania',
      'RWF': 'Rwanda',
      'UGX': 'Uganda',
      'NGN': 'Nigeria'
    };
    return countryMap[base] || base;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-card transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {instrument.bankName} - {instrument.type}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {instrument.bankName} • {getCountry(instrument.currencyPair)}
          </p>
        </div>
        <Badge variant={instrument.status === 'open' ? 'success' : 
          instrument.status === 'fully_subscribed' ? 'purple' : 'warning'}>
          {instrument.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="flex items-start gap-12 mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Target Yield</p>
          <p className="text-2xl font-bold text-primary-600">{instrument.projectedYield}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Term</p>
          <p className="text-2xl font-bold text-gray-900">{termMonths} months</p>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Funding Progress</span>
          <span className="text-sm font-semibold text-gray-900">{fundingPercentage}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>¥{instrument.subscribed.toLocaleString()}</span>
          <span>¥{instrument.principal.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-gray-500">Min. Investment</p>
          <p className="font-bold text-gray-900">¥{Math.round(instrument.principal * 0.1).toLocaleString()}</p>
        </div>
        <button 
          onClick={() => onInvest(instrument)}
          className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={instrument.status === 'fully_subscribed'}
        >
          Invest Now
        </button>
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, setFilters, onClose }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Yield Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Yield Range (%)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.yieldMin}
            onChange={(e) => setFilters({ ...filters, yieldMin: e.target.value })}
            className="input-field text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.yieldMax}
            onChange={(e) => setFilters({ ...filters, yieldMax: e.target.value })}
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Term */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Investment Term
        </label>
        <select
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className="select-field text-sm"
        >
          <option value="">All terms</option>
          {investmentTerms.map(term => (
            <option key={term.value} value={term.value}>{term.label}</option>
          ))}
        </select>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={filters.currency}
          onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
          className="select-field text-sm"
        >
          <option value="">All currencies</option>
          {currencies.map(curr => (
            <option key={curr.value} value={curr.value}>{curr.label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="select-field text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="partially_subscribed">Partially Subscribed</option>
          <option value="fully_subscribed">Fully Subscribed</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={() => setFilters({
            yieldMin: '',
            yieldMax: '',
            term: '',
            currency: '',
            status: ''
          })}
          className="flex-1 btn-secondary text-sm"
        >
          Clear All
        </button>
        <button 
          onClick={onClose}
          className="flex-1 btn-primary text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

const InvestmentOpportunitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    yieldMin: '',
    yieldMax: '',
    term: '',
    currency: '',
    status: ''
  });
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [investAmount, setInvestAmount] = useState('');

  const handleInvest = (instrument) => {
    setSelectedInstrument(instrument);
    setShowInvestModal(true);
  };

  // Filter instruments
  const filteredInstruments = demoInstruments.filter(inst => {
    // Search filter
    if (searchQuery && !inst.bankName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inst.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Yield filter
    if (filters.yieldMin && inst.projectedYield < parseFloat(filters.yieldMin)) return false;
    if (filters.yieldMax && inst.projectedYield > parseFloat(filters.yieldMax)) return false;
    // Status filter
    if (filters.status && inst.status !== filters.status) return false;
    // Currency filter
    if (filters.currency && !inst.currencyPair.includes(filters.currency)) return false;
    
    return true;
  });

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-500 mt-1">
            Discover high-yield investment opportunities in frontier markets
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filter Panel (collapsible) */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FilterPanel 
              filters={filters} 
              setFilters={setFilters} 
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Opportunities Grid */}
        <div className="flex-1">
          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredInstruments.length} opportunities
            </p>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option>Sort by: Highest Yield</option>
              <option>Sort by: Lowest Min. Investment</option>
              <option>Sort by: Shortest Term</option>
              <option>Sort by: Most Funded</option>
            </select>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredInstruments.map(instrument => (
              <OpportunityCard 
                key={instrument.id} 
                instrument={instrument}
                onInvest={handleInvest}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredInstruments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    yieldMin: '',
                    yieldMax: '',
                    term: '',
                    currency: '',
                    status: ''
                  });
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
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
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Target Yield</p>
                  <p className="font-semibold text-primary-600">{selectedInstrument.projectedYield}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest Rate</p>
                  <p className="font-semibold text-gray-900">{selectedInstrument.interestRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">FX Premium</p>
                  <p className="font-semibold text-gray-900">{selectedInstrument.forwardsRate}%</p>
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
                placeholder={`Min. ¥${Math.round(selectedInstrument.principal * 0.1).toLocaleString()}`}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">
                Available: ¥{(selectedInstrument.principal - selectedInstrument.subscribed).toLocaleString()} of ¥{selectedInstrument.principal.toLocaleString()}
              </p>
            </div>

            {/* Expected Returns */}
            {investAmount && parseFloat(investAmount) > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-800">Expected Annual Return</p>
                    <p className="text-2xl font-bold text-green-700">
                      ¥{Math.round(parseFloat(investAmount) * (selectedInstrument.projectedYield / 100)).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-800">Maturity Date</p>
                    <p className="font-semibold text-green-700">{selectedInstrument.maturityDate}</p>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Based on {selectedInstrument.projectedYield}% projected yield ({selectedInstrument.interestRate}% interest + {selectedInstrument.forwardsRate}% FX premium)
                </p>
              </div>
            )}

            {/* Terms Acceptance */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I have read and agree to the investment terms, risk disclosures, and understand that investments carry risk including potential loss of principal.
              </label>
            </div>

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

export default InvestmentOpportunitiesPage;
