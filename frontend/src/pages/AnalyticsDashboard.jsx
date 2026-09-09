import React, { useState, useEffect } from 'react';
import { getAnalyticsDashboard } from '../services/api';
import { BarChart3, TrendingUp, Users, Activity, DollarSign, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalyticsDashboard()
      .then((res) => {
        setData(res.data.data);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch executive analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading executive metrics...</div>;
  if (error) return <div className="p-8 text-red-400 bg-red-900/20 m-6 rounded-xl border border-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-indigo-400" /> Executive Revenue & Telemetry Analytics
        </h1>
        <p className="text-gray-400">SaaS MRR, churn rate, total token volume, and dunning status</p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">MRR</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">${data?.mrr?.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Metered Tokens</span>
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.telemetry?.totalTokens?.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Ingested Events: {data?.telemetry?.totalEvents}</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Churn Rate</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.churnRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Canceled Subscriptions: {data?.subscriptions?.canceled}</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Outstanding Invoices</span>
            <DollarSign className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">${data?.invoicing?.totalOutstanding?.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Unpaid Invoices: {data?.invoicing?.unpaid}</div>
        </div>
      </div>

      {/* Subscription Breakdown & Invoicing Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Subscriptions Overview</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Active Subscriptions</span>
              <span className="font-bold text-emerald-400">{data?.subscriptions?.active}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Past Due (Dunning Warning)</span>
              <span className="font-bold text-amber-400">{data?.subscriptions?.pastDue}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Canceled / Terminated</span>
              <span className="font-bold text-red-400">{data?.subscriptions?.canceled}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Billing & Invoicing Lifecycle</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Paid Invoices</span>
              <span className="font-bold text-emerald-400">{data?.invoicing?.paid}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Unpaid / Outstanding</span>
              <span className="font-bold text-amber-400">{data?.invoicing?.unpaid}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg border border-gray-750">
              <span className="text-gray-300">Total Metered Usage Value</span>
              <span className="font-bold text-indigo-400">${data?.telemetry?.totalRatedValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
