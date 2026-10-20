import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

interface BillingCycleToggleProps {
  period: 'monthly' | 'yearly';
  onChange: (period: 'monthly' | 'yearly') => void;
}

export const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({ period, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            period === 'monthly'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Monthly Billing</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('yearly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            period === 'yearly'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Yearly Billing</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            2 Months Free
          </span>
        </button>
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        <span>Automatic recurring renewals • Cancel anytime in one click</span>
      </p>
    </div>
  );
};
