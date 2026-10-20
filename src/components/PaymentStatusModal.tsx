import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Download, ArrowLeft, ShieldAlert } from 'lucide-react';
import type { VerifyPaymentResponse } from '../types/payment';

interface PaymentStatusModalProps {
  isOpen: boolean;
  status: 'success' | 'failed' | null;
  verificationResult: VerifyPaymentResponse | null;
  errorMessage?: string;
  amount: number;
  customerName: string;
  onClose: () => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  status,
  verificationResult,
  errorMessage,
  amount,
  customerName,
  onClose,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen || !status) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm bg-transparent p-0 m-auto max-w-lg w-[calc(100%-2rem)] rounded-3xl overflow-hidden focus:outline-none shadow-2xl border border-slate-800"
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 md:p-8 space-y-6">
        {status === 'success' ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Payment Successful</h3>
              <p className="text-sm text-slate-400">
                Transaction cryptographically verified by backend HMAC SHA-256
              </p>
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mt-1">
                Verified by FastAPI
              </div>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3.5 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400">Amount Paid</span>
                <span className="text-xl font-extrabold text-white">₹{amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Paid by</span>
                <span className="font-medium text-white">{customerName || 'Customer'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-mono text-slate-300">{new Date().toLocaleString()}</span>
              </div>

              {verificationResult?.payment_id && (
                <div className="flex justify-between items-center text-xs group">
                  <span className="text-slate-400">Payment ID</span>
                  <div className="flex items-center gap-1.5 font-mono text-indigo-300">
                    <span className="truncate max-w-[160px]">{verificationResult.payment_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(verificationResult.payment_id, 'payment_id')}
                      className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                      title="Copy Payment ID"
                    >
                      {copiedField === 'payment_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {verificationResult?.order_id && (
                <div className="flex justify-between items-center text-xs group">
                  <span className="text-slate-400">Razorpay Order ID</span>
                  <div className="flex items-center gap-1.5 font-mono text-indigo-300">
                    <span className="truncate max-w-[160px]">{verificationResult.order_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(verificationResult.order_id, 'order_id')}
                      className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                      title="Copy Order ID"
                    >
                      {copiedField === 'order_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                Print / Save Receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Failure Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/10">
                <XCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Payment Unsuccessful</h3>
              <p className="text-sm text-slate-400">
                The payment could not be completed or verified.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 flex items-start gap-3 text-sm text-rose-200">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-rose-300 mb-0.5">Error Details</span>
                <p className="text-xs leading-relaxed text-rose-200/90 font-mono">
                  {errorMessage || 'Payment was cancelled or signature verification failed.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Checkout & Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};
