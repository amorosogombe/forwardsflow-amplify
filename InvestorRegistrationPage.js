import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo, LoadingSpinner } from '../common';
import { useAuth } from '../../context/AuthContext';
import { investorTypes, moodysRatings, investmentTerms, currencies } from '../../data/mockData';

const InvestorRegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    // Account Credentials
    email: '',
    password: '',
    confirmPassword: '',
    
    // Investor Profile
    investorType: '',
    otherInvestorType: '',
    jobRole: '',
    
    // Investment Preferences
    ticketMin: '',
    ticketMax: '',
    preferredCurrency: '',
    targetYieldMin: '',
    targetYieldMax: '',
    minRating: '',
    maxRating: '',
    preferredTerm: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.investorType) {
      setError('Please select an investor type');
      return false;
    }
    if (formData.investorType === 'other' && !formData.otherInvestorType) {
      setError('Please specify your investor type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const result = await register({
      ...formData,
      role: 'tenant_admin',
      tenantType: 'investor',
      tenantName: formData.investorType === 'other' ? formData.otherInvestorType : investorTypes.find(t => t.value === formData.investorType)?.label,
    });
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Impact Investor Registration</h1>
            <p className="text-gray-500 mt-2">
              Join ForwardsFlow to access frontier economy returns with advanced economy security
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Credentials</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="investor@example.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="input-field pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Investor Profile Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Investor Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investor Type
                  </label>
                  <select
                    name="investorType"
                    value={formData.investorType}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="">Select investor type</option>
                    {investorTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.investorType === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      name="otherInvestorType"
                      value={formData.otherInvestorType}
                      onChange={handleChange}
                      placeholder="Enter your investor type"
                      className="input-field"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Role
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    placeholder="e.g., Portfolio Manager, Investment Director"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Investment Preferences Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Preferences</h2>
              <div className="space-y-4">
                {/* Ticket Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Range (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="ticketMin"
                      value={formData.ticketMin}
                      onChange={handleChange}
                      placeholder="Min"
                      className="input-field"
                    />
                    <input
                      type="number"
                      name="ticketMax"
                      value={formData.ticketMax}
                      onChange={handleChange}
                      placeholder="Max"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Deployment Currency
                  </label>
                  <select
                    name="preferredCurrency"
                    value={formData.preferredCurrency}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select currency</option>
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>

                {/* Target Yield Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Yield Range (% annually)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="targetYieldMin"
                      value={formData.targetYieldMin}
                      onChange={handleChange}
                      placeholder="Min %"
                      step="0.1"
                      className="input-field"
                    />
                    <input
                      type="number"
                      name="targetYieldMax"
                      value={formData.targetYieldMax}
                      onChange={handleChange}
                      placeholder="Max %"
                      step="0.1"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Moody's Rating Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Moody's Instrument Risk Rating Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="minRating"
                      value={formData.minRating}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">Min Rating</option>
                      {moodysRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>{rating.label}</option>
                      ))}
                    </select>
                    <select
                      name="maxRating"
                      value={formData.maxRating}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">Max Rating</option>
                      {moodysRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>{rating.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preferred Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Investment Term
                  </label>
                  <select
                    name="preferredTerm"
                    value={formData.preferredTerm}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select term</option>
                    {investmentTerms.map(term => (
                      <option key={term.value} value={term.value}>{term.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  Creating Account...
                </>
              ) : (
                'Create Investor Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorRegistrationPage;
