import React from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, Repeat, CheckCircle2 } from 'lucide-react';

interface OrderSummaryProps {
  planName: string;
  amount: number;
  period: 'monthly' | 'yearly';
  currency: string;
  isProcessing: boolean;
  onPay: () => void;
  disabled?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  planName,
  amount,
  period,
  currency,
  isProcessing,
  onPay,
  disabled,
}) => {
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
  const displayPeriod = period === 'monthly' ? '/ month' : '/ year';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-7 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-400" />
            Subscription Summary
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Recurring Mandate
          </span>
        </div>

        <div className="space-y-3.5 py-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Selected Plan</span>
            <span className="font-semibold text-white text-right">{planName}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Billing Cycle</span>
            <span className="font-medium text-indigo-300 capitalize">{period} recurring</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Currency</span>
            <span className="font-mono text-slate-300">{currency}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Mandate Setup Fee</span>
            <span className="text-emerald-400 font-medium">₹0.00 (Free Setup)</span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-semibold text-white block">Recurring Charge</span>
              <p className="text-[11px] text-slate-400">Auto-debits on renewal date</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {formattedAmount}
                </span>
                <span className="text-xs font-semibold text-indigo-400">{displayPeriod}</span>
              </div>
              <p className="text-[11px] text-slate-400">Inclusive of GST</p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Supported Autopay Methods</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            UPI Autopay (GPay, PhonePe, Paytm), Recurring Credit & Debit Cards (Visa, Mastercard, RuPay), and e-Mandate NetBanking.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={onPay}
          disabled={disabled || isProcessing}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all duration-200 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authorizing Subscription...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Subscribe Now ({formattedAmount}{displayPeriod})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Razorpay Mandates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-semibold">FastAPI Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
