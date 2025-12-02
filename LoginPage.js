import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo, LoadingSpinner } from '../common';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        const dashboardPath = getDashboardPath();
        navigate(dashboardPath);
      }, 500);
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  // Demo credentials helper
  const fillDemoCredentials = (userType) => {
    const credentials = {
      superAdmin: { email: 'admin@forwardsflow.com', password: 'admin123' },
      investorAdmin: { email: 'admin@impactcapital.com', password: 'demo123' },
      bankAdmin: { email: 'admin@equityafrica.com', password: 'demo123' },
      investorUser: { email: 'analyst@impactcapital.com', password: 'demo123' },
      bankUser: { email: 'lending@equityafrica.com', password: 'demo123' },
    };
    
    const creds = credentials[userType];
    setFormData(prev => ({ ...prev, ...creds }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Logo size="large" variant="white" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Frontier economy returns,<br />
              <span className="text-white/90">advanced economy security.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Connect impact investors with frontier economy banks for high-yield deposit instruments and mobile lending opportunities.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold">$16.9M+</p>
              <p className="text-white/70 text-sm">Capital Deployed</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div>
              <p className="text-3xl font-bold">4,200+</p>
              <p className="text-white/70 text-sm">Active Loans</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div>
              <p className="text-3xl font-bold">31.2%</p>
              <p className="text-white/70 text-sm">Avg. Yield</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Logo size="large" />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
            </div>

            {/* Demo Credentials Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-3">Demo Credentials</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('superAdmin')}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                  Super Admin
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('bankAdmin')}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                  Bank Admin
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('investorAdmin')}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                  Investor Admin
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('bankUser')}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                  Bank User
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials('investorUser')}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                  Investor User
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>

              {/* Password */}
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
                    placeholder="Enter your password"
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

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © 2024 ForwardsFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
