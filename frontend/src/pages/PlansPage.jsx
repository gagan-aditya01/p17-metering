import React, { useState, useEffect } from 'react';
import { getPlans, createPlan } from '../services/api';
import { Layers, Plus, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseFee: 0,
    currency: 'USD',
    unitName: 'tokens',
    usageTiers: [{ upTo: 100000, unitPrice: 0.0001 }]
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      setPlans(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddTier = () => {
    setFormData({
      ...formData,
      usageTiers: [...formData.usageTiers, { upTo: '', unitPrice: 0 }]
    });
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...formData.usageTiers];
    updatedTiers[index][field] = value === '' ? '' : Number(value);
    setFormData({ ...formData, usageTiers: updatedTiers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPlan({
        ...formData,
        baseFee: Number(formData.baseFee),
        usageTiers: formData.usageTiers.map(t => ({
          upTo: t.upTo ? Number(t.upTo) : null,
          unitPrice: Number(t.unitPrice)
        }))
      });
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        baseFee: 0,
        currency: 'USD',
        unitName: 'tokens',
        usageTiers: [{ upTo: 100000, unitPrice: 0.0001 }]
      });
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating plan');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Layers className="text-indigo-400" /> Subscription & Metering Plans
          </h1>
          <p className="text-gray-400">Define base pricing, currencies, and tiered token rates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" /> Create New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center text-gray-400">
          No active plans found. Click "Create New Plan" to set up your first pricing tier.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-500 transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-700 font-semibold">
                    {plan.currency}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{plan.description || 'No description provided'}</p>
                <div className="text-3xl font-extrabold text-white mb-4">
                  ${plan.baseFee} <span className="text-sm font-normal text-gray-400">/ month</span>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Usage Rates ({plan.unitName})</h4>
                  {plan.usageTiers && plan.usageTiers.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                      {plan.usageTiers.map((tier, idx) => (
                        <li key={idx} className="flex justify-between text-gray-300">
                          <span>{tier.upTo ? `Up to ${tier.upTo.toLocaleString()} ${plan.unitName}` : `Above ${plan.usageTiers[idx-1]?.upTo?.toLocaleString() || 0}`}</span>
                          <span className="font-mono text-emerald-400">${tier.unitPrice} / unit</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No usage tiers defined</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Plan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer Tier"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Plan features and limits..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Base Fee ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={formData.baseFee}
                    onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Unit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="tokens"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={formData.unitName}
                    onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Usage Tiers</label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Tier
                  </button>
                </div>
                {formData.usageTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      placeholder={idx === formData.usageTiers.length - 1 ? "Limit (blank for ∞)" : "Up to limit"}
                      className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={tier.upTo}
                      onChange={(e) => handleTierChange(idx, 'upTo', e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.00001"
                      required
                      placeholder="Price per unit"
                      className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={tier.unitPrice}
                      onChange={(e) => handleTierChange(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
