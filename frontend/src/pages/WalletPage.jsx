import React, { useState, useEffect } from 'react';
import { getWallet, topUpWallet, getCustomers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EntitlementBanner from '../components/EntitlementBanner';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, DollarSign, History, AlertCircle } from 'lucide-react';

export default function WalletPage() {
  const { user, isAdmin } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Top-Up Modal
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [topUpForm, setTopUpForm] = useState({ amount: 50, description: 'Prepaid Token Credits Purchase' });
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const params = {};
      if (isAdmin && selectedCustomerId) {
        params.customerId = selectedCustomerId;
      }
      const res = await getWallet(params);
      setWalletData(res.data.data.wallet);
      setTransactions(res.data.data.transactions || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wallet information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    if (isAdmin) {
      getCustomers().then(res => setCustomers(res.data.data)).catch(() => {});
    }
  }, [selectedCustomerId]);

  const handleTopUp = async (e) => {
    e.preventDefault();
    setTopUpLoading(true);
    try {
      await topUpWallet({
        amount: Number(topUpForm.amount),
        customerId: isAdmin ? (selectedCustomerId || walletData?.customerId?._id || walletData?.customerId) : user.customerId,
        description: topUpForm.description
      });
      setShowTopUpModal(false);
      setTopUpForm({ amount: 50, description: 'Prepaid Token Credits Purchase' });
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || 'Top-up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-indigo-400" /> Prepaid Wallet & Ledger Audit
          </h1>
          <p className="text-gray-400">Entitlement balances, top-ups, and real-time rated debit logs</p>
        </div>
        <button
          onClick={() => setShowTopUpModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" /> Add Credit Top-Up
        </button>
      </div>

      {/* Low Balance / Entitlement Banner */}
      {walletData && (
        <EntitlementBanner
          balance={walletData.balance}
          onTopUpClick={() => setShowTopUpModal(true)}
        />
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> {error}
        </div>
      )}

      {/* Admin Customer Filter */}
      {isAdmin && customers.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex items-center gap-4">
          <span className="text-sm text-gray-400 font-semibold">Select Customer Wallet:</span>
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>
      )}

      {/* Balance Summary Card */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading wallet data...</div>
      ) : walletData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl relative overflow-hidden">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Available Balance</span>
            <div className="text-4xl font-extrabold text-white mt-2">
              ${walletData.balance.toFixed(2)} <span className="text-sm font-normal text-gray-400">{walletData.currency}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                walletData.balance > 0 ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
                {walletData.balance > 0 ? '● Active Entitlement' : '● Usage Blocked (0.00)'}
              </span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Account Owner</span>
            <div className="text-xl font-bold text-white mt-2">
              {walletData.customerId?.name || 'Customer Account'}
            </div>
            <div className="text-xs text-gray-400 mt-1">{walletData.customerId?.email}</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Auto Top-Up Status</span>
            <div className="text-xl font-bold text-white mt-2">
              {walletData.autoTopUp ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Threshold: ${walletData.threshold || 10}</div>
          </div>
        </div>
      ) : null}

      {/* Ledger Audit Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Wallet Financial Ledger
          </h3>
          <span className="text-xs text-gray-400 font-mono">{transactions.length} Ledger entries</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No transactions recorded for this wallet.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      tx.type === 'credit'
                        ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                        : 'bg-indigo-900/50 text-indigo-300 border-indigo-700'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> : <ArrowUpRight className="w-3 h-3 text-indigo-400" />}
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{tx.description}</td>
                  <td className={`px-6 py-4 text-right font-mono font-extrabold text-base ${
                    tx.type === 'credit' ? 'text-emerald-400' : 'text-indigo-300'
                  }`}>
                    {tx.type === 'credit' ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(4)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <DollarSign className="text-emerald-400 w-6 h-6" /> Credit Top-Up
            </h2>
            <p className="text-sm text-gray-400 mb-4">Add funds to customer wallet for usage-based metering.</p>

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Top-Up Amount ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                  value={topUpForm.amount}
                  onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Memo / Description</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  value={topUpForm.description}
                  onChange={(e) => setTopUpForm({ ...topUpForm, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topUpLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  {topUpLoading ? 'Processing...' : 'Confirm Top-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
