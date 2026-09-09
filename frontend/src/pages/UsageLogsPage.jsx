import React, { useState, useEffect } from 'react';
import { getUsageLogs, ingestUsage, getCustomers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, Zap, Filter, Play, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';

export default function UsageLogsPage() {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [eventNameFilter, setEventNameFilter] = useState('');

  // Simulator Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simApiKey, setSimApiKey] = useState('');
  const [simPayload, setSimPayload] = useState({
    eventName: 'llm_tokens',
    units: 1500,
    metadata: JSON.stringify({ model: 'gpt-4o', prompt_tokens: 500, completion_tokens: 1000 }, null, 2)
  });
  const [simResult, setSimResult] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCustomerId) params.customerId = selectedCustomerId;
      if (eventNameFilter) params.eventName = eventNameFilter;

      const res = await getUsageLogs(params);
      setLogs(res.data.data);
      setTotalUnits(res.data.totalUnits || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch usage logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (isAdmin) {
      getCustomers().then(res => setCustomers(res.data.data)).catch(() => {});
    }
  }, [selectedCustomerId, eventNameFilter]);

  const handleSimulateIngest = async (e) => {
    e.preventDefault();
    setSimResult(null);
    try {
      let metaObj = {};
      try {
        metaObj = JSON.parse(simPayload.metadata);
      } catch (err) {
        alert('Invalid JSON metadata');
        return;
      }

      const res = await ingestUsage(simApiKey, {
        eventName: simPayload.eventName,
        units: Number(simPayload.units),
        metadata: metaObj
      });

      setSimResult({ success: true, data: res.data });
      fetchLogs();
    } catch (err) {
      setSimResult({ success: false, error: err.response?.data?.message || 'Ingestion failed' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" /> High-Throughput Usage Ingestion Logs
          </h1>
          <p className="text-gray-400">Real-time AI token consumption & raw metering telemetry</p>
        </div>
        <button
          onClick={() => setShowSimulateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-600/30"
        >
          <Play className="w-4 h-4 fill-white" /> Simulate API Ingest
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> {error}
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-400 uppercase font-semibold tracking-wider">Total Metered Units</span>
            <div className="text-3xl font-extrabold text-white mt-1">{totalUnits.toLocaleString()}</div>
          </div>
          <Zap className="w-10 h-10 text-amber-400" />
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-400 uppercase font-semibold tracking-wider">Total Ingested Events</span>
            <div className="text-3xl font-extrabold text-white mt-1">{logs.length}</div>
          </div>
          <Cpu className="w-10 h-10 text-indigo-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="w-4 h-4 text-indigo-400" /> Filter Telemetry:
        </div>

        {isAdmin && (
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Filter by eventName (e.g. llm_tokens)..."
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
          value={eventNameFilter}
          onChange={(e) => setEventNameFilter(e.target.value)}
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading telemetry logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center text-gray-400">
          No usage events recorded yet. Click "Simulate API Ingest" to post a test event using an API key.
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Units Metered</th>
                <th className="px-6 py-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">{log.customerId?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700 px-2.5 py-1 rounded-full text-xs font-mono">
                      {log.eventName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-emerald-400 font-mono">
                    +{log.units.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <pre className="bg-gray-900 border border-gray-700 p-2 rounded text-xs text-gray-400 overflow-x-auto max-w-md font-mono">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Play className="text-indigo-400 w-5 h-5 fill-indigo-400" /> Metering API Ingestion Simulator
            </h2>
            <p className="text-sm text-gray-400 mb-4">Post a telemetry event to <code className="text-indigo-300">POST /api/v1/usage/ingest</code> using a customer API Key header (<code className="text-indigo-300">x-api-key</code>).</p>

            <form onSubmit={handleSimulateIngest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer x-api-key Header</label>
                <input
                  type="text"
                  required
                  placeholder="p17_live_..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 font-mono text-sm text-indigo-300 focus:outline-none focus:border-indigo-500"
                  value={simApiKey}
                  onChange={(e) => setSimApiKey(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="llm_tokens"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    value={simPayload.eventName}
                    onChange={(e) => setSimPayload({ ...simPayload, eventName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Units (e.g. Tokens)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    value={simPayload.units}
                    onChange={(e) => setSimPayload({ ...simPayload, units: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Metadata (JSON)</label>
                <textarea
                  rows="4"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                  value={simPayload.metadata}
                  onChange={(e) => setSimPayload({ ...simPayload, metadata: e.target.value })}
                />
              </div>

              {simResult && (
                <div className={`p-3 rounded-lg text-xs font-mono border ${
                  simResult.success ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200' : 'bg-red-900/40 border-red-500 text-red-200'
                }`}>
                  {simResult.success ? '✓ 201 Created: Event Ingested Successfully' : `✗ Error: ${simResult.error}`}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Ingest Payload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
