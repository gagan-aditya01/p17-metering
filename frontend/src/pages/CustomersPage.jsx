import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, getPlans, createSubscription } from '../services/api';
import { Users, Plus, Key, Copy, Check, CreditCard, AlertCircle } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', currency: 'USD' });
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, planRes] = await Promise.all([getCustomers(), getPlans()]);
      setCustomers(custRes.data.data);
      setPlans(planRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(customerForm);
      setShowCustomerModal(false);
      setCustomerForm({ name: '', email: '', currency: 'USD' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!selectedPlanId || !selectedCustomer) return;
    try {
      await createSubscription({
        customerId: selectedCustomer._id,
        planId: selectedPlanId
      });
      setShowAssignModal(false);
      setSelectedCustomer(null);
      setSelectedPlanId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign plan');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400" /> Customer Management
          </h1>
          <p className="text-gray-400">Onboard developers, manage API keys, and assign metering plans</p>
        </div>
        <button
          onClick={() => setShowCustomerModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" /> Onboard Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center text-gray-400">
          No customers registered yet. Click "Onboard Customer" to create your first tenant.
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">API Key</th>
                <th className="px-6 py-4">Assigned Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {customers.map((cust) => (
                <tr key={cust._id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{cust.name}</div>
                    <div className="text-gray-400 text-xs">{cust.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg w-max font-mono text-xs text-indigo-300">
                      <Key className="w-3.5 h-3.5 text-gray-400" />
                      <span>{cust.apiKey ? `${cust.apiKey.slice(0, 14)}...` : 'N/A'}</span>
                      <button
                        onClick={() => handleCopyKey(cust.apiKey)}
                        className="text-gray-400 hover:text-white transition"
                        title="Copy Key"
                      >
                        {copiedKey === cust.apiKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cust.subscription?.planId ? (
                      <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {cust.subscription.planId.name} (${cust.subscription.planId.baseFee}/mo)
                      </span>
                    ) : (
                      <span className="text-gray-500 italic text-xs">No active plan</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      cust.status === 'active' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'
                    }`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setSelectedPlanId(cust.subscription?.planId?._id || '');
                        setShowAssignModal(true);
                      }}
                      className="inline-flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      {cust.subscription ? 'Change Plan' : 'Assign Plan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Onboard Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Onboard Customer</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company / Developer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme AI Corp"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Billing Email</label>
                <input
                  type="email"
                  required
                  placeholder="billing@acme.ai"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Create & Generate API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subscription Plan Modal */}
      {showAssignModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Assign Subscription Plan</h2>
            <p className="text-sm text-gray-400 mb-4">Select pricing & metering tier for <span className="text-white font-semibold">{selectedCustomer.name}</span></p>

            <form onSubmit={handleAssignPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Plan</label>
                {plans.length === 0 ? (
                  <div className="text-sm text-amber-400 bg-amber-900/30 p-3 rounded-lg border border-amber-700">
                    No active plans available. Create a plan in the Plans tab first.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((plan) => (
                      <label
                        key={plan._id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                          selectedPlanId === plan._id
                            ? 'bg-indigo-900/40 border-indigo-500 text-white'
                            : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selectedPlan"
                            value={plan._id}
                            checked={selectedPlanId === plan._id}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-semibold">{plan.name}</div>
                            <div className="text-xs text-gray-400">{plan.description || 'Standard rate'}</div>
                          </div>
                        </div>
                        <div className="font-bold text-indigo-400">${plan.baseFee}/mo</div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPlanId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  Confirm Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
