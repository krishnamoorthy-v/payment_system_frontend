import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import type { PaymentPlan } from '../types/payment';
import { DEFAULT_PLANS } from '../constants/plans';

interface PlanSelectorProps {
  selectedPlanId: string;
  onSelectPlan: (plan: PaymentPlan) => void;
  customAmount: number;
  onCustomAmountChange: (amount: number) => void;
  isCustom: boolean;
  onToggleCustom: (isCustom: boolean) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlanId,
  onSelectPlan,
  customAmount,
  onCustomAmountChange,
  isCustom,
  onToggleCustom,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Select Payment Option
          </h2>
          <p className="text-sm text-slate-400">Choose a predefined plan or enter your custom amount</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleCustom(!isCustom)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            isCustom
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          {isCustom ? '← View Preset Plans' : 'Custom Amount'}
        </button>
      </div>

      {isCustom ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/40 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-3">
            <Zap className="w-4 h-4 text-indigo-400" /> Custom Checkout Amount
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount || ''}
              onChange={(e) => onCustomAmountChange(Math.max(1, Number(e.target.value)))}
              placeholder="Enter amount (e.g. 500)"
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-indigo-500/50 rounded-xl text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Minimum: ₹1.00</span>
            <span className="text-indigo-400 font-medium">Currency: INR</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEFAULT_PLANS.map((plan) => {
            const isSelected = !isCustom && selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  onToggleCustom(false);
                  onSelectPlan(plan);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleCustom(false);
                    onSelectPlan(plan);
                  }
                }}
                className={`relative p-5 rounded-2xl cursor-pointer border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-bold rounded-full shadow-md">
                    {plan.badge || 'Popular'}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white text-base">{plan.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-white">₹{plan.amount.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ one-time</span>
                  </div>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
