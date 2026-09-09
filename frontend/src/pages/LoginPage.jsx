import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { ShieldCheck, Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser(formData);
        await login({ email: formData.email, password: formData.password });
      } else {
        await login({ email: formData.email, password: formData.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600/20 p-4 rounded-full border border-indigo-500/30">
            <ShieldCheck className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-1">
          {isRegistering ? 'Create P17 Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          {isRegistering ? 'Set up your admin or tenant credentials' : 'Sign in to access P17 Metering Platform'}
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="admin@p17metering.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Role</label>
              <select
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">Platform Admin</option>
                <option value="customer">Customer / Tenant User</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/30 mt-2"
          >
            {loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-indigo-400 hover:underline font-medium"
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
