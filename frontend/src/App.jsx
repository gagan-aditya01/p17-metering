import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Users, CreditCard, BarChart2, ShieldCheck, Layers, LogOut, Wallet, FileText, PieChart } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import PlansPage from './pages/PlansPage';
import CustomersPage from './pages/CustomersPage';
import UsageLogsPage from './pages/UsageLogsPage';
import WalletPage from './pages/WalletPage';
import InvoicesPage from './pages/InvoicesPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">P17 Metering Dashboard</h1>
      <p className="text-gray-400 mb-6">Real-time Usage-Based Billing & AI Token Metering</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Authenticated Role</span>
            <ShieldCheck className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white capitalize">{user?.role || 'Guest'}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Automated Dunning & Invoicing</span>
            <FileText className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">Sprint 4 Live</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Revenue Analytics</span>
            <PieChart className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">MRR & Churn Active</div>
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
          : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );
};

function MainLayout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <ShieldCheck className="text-indigo-500 w-8 h-8" />
            <span className="text-xl font-bold text-white tracking-wide">P17 Metering</span>
          </div>

          <nav className="space-y-1.5">
            <NavLink to="/" icon={BarChart2}>
              Dashboard
            </NavLink>
            
            <NavLink to="/usage" icon={Activity}>
              Usage Telemetry Logs
            </NavLink>

            <NavLink to="/wallet" icon={Wallet}>
              Prepaid Wallet & Ledger
            </NavLink>

            <NavLink to="/invoices" icon={FileText}>
              Invoices & Settlement
            </NavLink>

            {isAdmin && (
              <>
                <div className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Ops
                </div>
                <NavLink to="/analytics" icon={PieChart}>
                  Revenue Analytics
                </NavLink>
                <NavLink to="/plans" icon={Layers}>
                  Plans & Tier Rates
                </NavLink>
                <NavLink to="/customers" icon={Users}>
                  Customer Onboarding
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-750 text-xs text-gray-400">
            <div className="font-semibold text-white truncate">{user?.name}</div>
            <div className="text-gray-500 truncate">{user?.email}</div>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700">
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/usage" element={<ProtectedRoute><UsageLogsPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsDashboard /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute requiredRole="admin"><PlansPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute requiredRole="admin"><CustomersPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
