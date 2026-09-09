import React from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';

export default function EntitlementBanner({ balance = 0, onTopUpClick }) {
  if (balance > 10) return null; // No banner if healthy balance

  const isExhausted = balance <= 0;

  return (
    <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between shadow-lg ${
      isExhausted
        ? 'bg-red-950/80 border-red-500 text-red-200'
        : 'bg-amber-950/80 border-amber-500 text-amber-200'
    }`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${isExhausted ? 'text-red-400' : 'text-amber-400'}`} />
        <div>
          <h4 className="font-bold text-sm">
            {isExhausted ? '⚠️ Entitlement Exhausted (Usage Gated)' : '⚠️ Low Credit Balance Warning'}
          </h4>
          <p className="text-xs opacity-90">
            {isExhausted
              ? 'Your prepaid wallet balance is $0.00. High-throughput usage ingestion is currently blocked (HTTP 402).'
              : `Your balance is currently $${balance.toFixed(2)}. Top up to prevent service interruption.`}
          </p>
        </div>
      </div>
      {onTopUpClick && (
        <button
          onClick={onTopUpClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition ${
            isExhausted
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Top Up Credits
        </button>
      )}
    </div>
  );
}
