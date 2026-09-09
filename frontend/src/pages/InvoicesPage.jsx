import React, { useState, useEffect } from 'react';
import { getInvoices, payInvoice, generateInvoices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, CheckCircle, RefreshCw, Eye, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function InvoicesPage() {
  const { user, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoices();
      setInvoices(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    try {
      await payInvoice(invoiceId);
      fetchInvoices();
      if (selectedInvoice && selectedInvoice._id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      await generateInvoices();
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Invoice generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="text-indigo-400" /> Invoicing & Settlement
          </h1>
          <p className="text-gray-400">Automated recurring billing, line items, and invoice settlement</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Generate Billing Run
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center text-gray-400">
          No invoices issued yet. Click "Generate Billing Run" to aggregate active subscriptions and metered usage.
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Billing Period</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-300">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{inv.customerId?.name || 'Customer'}</div>
                    <div className="text-gray-400 text-xs">{inv.customerId?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                    {new Date(inv.billingPeriod?.start).toLocaleDateString()} - {new Date(inv.billingPeriod?.end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-white font-mono text-base">
                    ${inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                      inv.status === 'paid'
                        ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                        : 'bg-amber-900/50 text-amber-300 border-amber-700'
                    }`}>
                      ● {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="inline-flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    {inv.status === 'unpaid' && (
                      <button
                        onClick={() => handlePayInvoice(inv._id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Detail / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-8 print:p-0 print:bg-white print:text-black">
            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white print:text-black">INVOICE</h2>
                <div className="text-sm font-mono text-indigo-400 print:text-black">{selectedInvoice.invoiceNumber}</div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  selectedInvoice.status === 'paid' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700' : 'bg-amber-900/50 text-amber-300 border-amber-700'
                }`}>
                  {selectedInvoice.status}
                </span>
                <div className="text-xs text-gray-400 mt-2">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billed To</h4>
                <div className="font-bold text-white print:text-black">{selectedInvoice.customerId?.name}</div>
                <div className="text-gray-400 print:text-black">{selectedInvoice.customerId?.email}</div>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billing Period</h4>
                <div className="text-gray-300 print:text-black font-mono">
                  {new Date(selectedInvoice.billingPeriod?.start).toLocaleDateString()} - {new Date(selectedInvoice.billingPeriod?.end).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700 mb-6 print:border-gray-300">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold uppercase text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {selectedInvoice.lineItems?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-gray-200 print:text-black font-medium">{item.description}</td>
                      <td className="py-2.5 text-right font-mono text-gray-400">{item.quantity.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-white print:text-black">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                P17 Metering System • Automated Enterprise Billing
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400 mr-2">Total Amount Due:</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">${selectedInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <Download className="w-4 h-4" /> Download / Print PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
