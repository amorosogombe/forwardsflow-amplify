import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo, LoadingSpinner } from '../common';
import { useAuth } from '../../context/AuthContext';
import { lendingInstitutionTypes, countries } from '../../data/mockData';

const BankRegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    // Account Credentials
    email: '',
    password: '',
    confirmPassword: '',
    
    // Institution Profile
    institutionType: '',
    otherInstitutionType: '',
    headquartersCountry: '',
    jobRole: '',
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
    if (!formData.institutionType) {
      setError('Please select an institution type');
      return false;
    }
    if (formData.institutionType === 'other' && !formData.otherInstitutionType) {
      setError('Please specify your institution type');
      return false;
    }
    if (!formData.headquartersCountry) {
      setError('Please select your headquarters country');
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
      tenantType: 'bank',
      tenantName: formData.institutionType === 'other' 
        ? formData.otherInstitutionType 
        : lendingInstitutionTypes.find(t => t.value === formData.institutionType)?.label,
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
              <div className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2">
                <span className="text-sm font-medium">⚡F</span>
                <span className="font-semibold">Forwards Flow</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Bank Registration</h1>
            <p className="text-gray-500 mt-2">
              Partner with ForwardsFlow to access capital markets and deploy via mobile lending
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
                    placeholder="contact@bank.com"
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

            {/* Institution Profile Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Institution Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Type
                  </label>
                  <select
                    name="institutionType"
                    value={formData.institutionType}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="">Select institution type</option>
                    {lendingInstitutionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.institutionType === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      name="otherInstitutionType"
                      value={formData.otherInstitutionType}
                      onChange={handleChange}
                      placeholder="Enter your institution type"
                      className="input-field"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headquarters Country
                  </label>
                  <select
                    name="headquartersCountry"
                    value={formData.headquartersCountry}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>{country.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Role
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    placeholder="e.g., CFO, Treasury Director, CEO"
                    className="input-field"
                  />
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
                'Create Partner Account'
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

export default BankRegistrationPage;
