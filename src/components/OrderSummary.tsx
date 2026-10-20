import React from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, CreditCard } from 'lucide-react';

interface OrderSummaryProps {
  planName: string;
  amount: number;
  currency: string;
  isProcessing: boolean;
  onPay: () => void;
  disabled?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  planName,
  amount,
  currency,
  isProcessing,
  onPay,
  disabled,
}) => {
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Order Summary
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Live Gateway
          </span>
        </div>

        <div className="space-y-3 py-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Item / Service</span>
            <span className="font-medium text-white text-right">{planName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Currency</span>
            <span className="font-mono text-slate-300">{currency}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Gateway Processing Fee</span>
            <span className="text-emerald-400 font-medium">₹0.00 (Waived)</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-base font-semibold text-white">Total Amount</span>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {formattedAmount}
              </span>
              <p className="text-[11px] text-slate-400">Inclusive of all taxes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={onPay}
          disabled={disabled || isProcessing}
          className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing with Razorpay...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay {formattedAmount} via Razorpay</span>
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
            <span>PCI-DSS Certified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-semibold">FastAPI Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
