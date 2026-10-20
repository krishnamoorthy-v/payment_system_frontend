import React from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import type { SubscriptionPlan } from '../types/payment';

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  period: 'monthly' | 'yearly';
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  period,
}) => {
  // Filter plans by selected period
  const filteredPlans = plans.filter((p) => p.period === period);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Choose Subscription Tier
        </h2>
        <p className="text-sm text-slate-400">
          Select the recurring billing tier that matches your payment requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => {
          const isSelected = selectedPlan?.code === plan.code || selectedPlan?.plan_id === plan.plan_id;
          const displayPeriod = period === 'monthly' ? '/ month' : '/ year';

          return (
            <div
              key={plan.code || plan.plan_id}
              onClick={() => onSelectPlan(plan)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPlan(plan);
                }
              }}
              className={`relative p-5 rounded-2xl cursor-pointer border text-left transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wide rounded-full shadow-md ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-slate-800 border border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5 mt-1">
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    {plan.name}
                  </h3>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-500 border-indigo-400 text-white scale-110 shadow-sm shadow-indigo-500/50'
                        : 'border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 min-h-[32px] line-clamp-2">
                  {plan.description}
                </p>

                <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white tracking-tight">
                      ₹{plan.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-indigo-400 font-semibold">{displayPeriod}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {period === 'monthly' ? 'Renews monthly • Cancel anytime' : 'Billed annually • 2 Months free'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">Included Features</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
