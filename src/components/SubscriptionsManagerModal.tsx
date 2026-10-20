import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  RefreshCw,
  CheckCircle2,
  Clock,
  Ban,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { SubscriptionItem } from '../types/payment';

interface SubscriptionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionsManagerModal: React.FC<SubscriptionsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSubscriptions();
      setSubscriptions(data.subscriptions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptions();
      setConfirmCancelId(null);
      setActionSuccess(null);
    }
  }, [isOpen]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancellingId(subscriptionId);
    setActionSuccess(null);
    try {
      await apiService.cancelSubscription(subscriptionId);
      setActionSuccess(`Subscription ${subscriptionId} cancelled successfully.`);
      setConfirmCancelId(null);
      await fetchSubscriptions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Subscription Management</h2>
              <p className="text-xs text-slate-400">View active recurring plans and auto-debit statuses</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubscriptions}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <p className="text-sm">Loading subscriptions from database...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No subscriptions created yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you select a plan and complete recurring mandate authorization, your subscriptions will appear here.
              </p>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const isActive = sub.status === 'active';
              const isCancelled = sub.status === 'cancelled';
              const isConfirming = confirmCancelId === sub.subscription_id;
              const isCancelling = cancellingId === sub.subscription_id;

              return (
                <div
                  key={sub.subscription_id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-slate-900/90 border-slate-700/80 hover:border-indigo-500/60 shadow-lg'
                      : isCancelled
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {sub.plan_name || sub.plan_code || 'Subscription Plan'}
                        </h4>

                        {/* Status Badge */}
                        {isActive && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active
                          </span>
                        )}
                        {sub.status === 'created' && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            Pending Authorization
                          </span>
                        )}
                        {isCancelled && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                            <Ban className="w-3 h-3" />
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>ID:</span>
                        <code className="text-indigo-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {sub.subscription_id}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(sub.subscription_id)}
                          className="hover:text-white transition-colors"
                          title="Copy ID"
                        >
                          {copiedId === sub.subscription_id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-lg font-black text-white">
                        ₹{sub.amount.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-semibold text-indigo-400">/ {sub.period}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Paid Cycles: {sub.paid_count} of {sub.total_count}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Timestamp row */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      {sub.customer?.name && (
                        <span>
                          Customer: <strong className="text-slate-300 font-medium">{sub.customer.name}</strong> ({sub.customer.email})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span>Created: {new Date(sub.created_at).toLocaleDateString()}</span>

                      {/* Cancel Action Button */}
                      {!isCancelled && (
                        <div>
                          {isConfirming ? (
                            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-rose-500/40">
                              <span className="text-[11px] text-rose-300 font-medium">Confirm cancel?</span>
                              <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => handleCancelSubscription(sub.subscription_id)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
                              >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmCancelId(null)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[11px]"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(sub.subscription_id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Cancel Plan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <span>Razorpay Subscriptions & Mandates API</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
