import { useState, useEffect } from 'react';
import { ShieldCheck, Zap, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { PlanSelector } from './components/PlanSelector';
import { CustomerForm } from './components/CustomerForm';
import { OrderSummary } from './components/OrderSummary';
import { PaymentStatusModal } from './components/PaymentStatusModal';
import { apiService, ApiError } from './services/api';
import { loadRazorpayScript } from './utils/loadRazorpay';
import { DEFAULT_PLANS } from './constants/plans';
import type {
  CustomerDetails,
  PaymentPlan,
  RazorpaySuccessResponse,
  VerifyPaymentResponse,
} from './types/payment';

export function App() {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(DEFAULT_PLANS[1]);
  const [customAmount, setCustomAmount] = useState<number>(500);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: 'Krishna Sharma',
    email: 'krishna@example.com',
    phone: '9876543210',
  });

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendError, setBackendError] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyPaymentResponse | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string>('');

  const currentAmount = isCustom ? customAmount : selectedPlan.amount;
  const currentPlanName = isCustom ? 'Custom Payment' : selectedPlan.name;

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    setBackendError('');
    try {
      await apiService.getConfig();
      setBackendStatus('connected');
    } catch (err: unknown) {
      setBackendStatus('error');
      const msg = err instanceof Error ? err.message : 'Cannot reach FastAPI backend';
      setBackendError(msg);
    }
  };

  useEffect(() => {
    let ignore = false;
    apiService.getConfig()
      .then(() => {
        if (!ignore) {
          setBackendStatus('connected');
          setBackendError('');
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setBackendStatus('error');
          setBackendError(err instanceof Error ? err.message : 'Cannot reach FastAPI backend');
        }
      });

    loadRazorpayScript();

    return () => {
      ignore = true;
    };
  }, []);

  const validateForm = (): boolean => {
    if (!customer.fullName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.length < 8) {
      setFormError('Please enter a valid contact phone number.');
      return false;
    }
    if (currentAmount <= 0) {
      setFormError('Amount must be greater than ₹0.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setFormError(null);

    try {
      // 1. Ensure Razorpay SDK script is ready
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Checkout SDK. Please check your network connection.');
      }

      // 2. Request order creation from FastAPI backend
      const order = await apiService.createOrder({
        amount: currentAmount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        customer: {
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
        notes: {
          customer_name: customer.fullName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          plan: currentPlanName,
        },
      });


      // 3. Initialize and trigger Razorpay Checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Payment Gateway Demo',
        description: `Order for ${currentPlanName}`,
        order_id: order.order_id,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          receipt: order.receipt,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            // 4. Send signature to FastAPI backend for verification
            const verifyRes = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setVerificationResult(verifyRes);
            setPaymentStatus('success');
            setModalOpen(true);
          } catch (verifyErr: unknown) {
            const msg = verifyErr instanceof Error ? verifyErr.message : 'Signature verification failed';
            setModalErrorMessage(msg);
            setPaymentStatus('failed');
            setModalOpen(true);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Payment initiation failed';
      setModalErrorMessage(msg);
      setPaymentStatus('failed');
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">Razorpay Gateway</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  FastAPI
                </span>
              </div>
              <p className="text-xs text-slate-400">Secure end-to-end checkout & verification</p>
            </div>
          </div>

          {/* Backend Status Badge */}
          <div className="flex items-center gap-2">
            {backendStatus === 'connected' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Backend Connected</span>
              </div>
            ) : backendStatus === 'checking' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking API...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={checkBackendHealth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all cursor-pointer"
                title="FastAPI server not responding. Click to retry."
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>FastAPI Offline (Retry)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1 w-full">
        {/* Banner if backend is offline */}
        {backendStatus === 'error' && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-300">FastAPI backend is not reachable at http://127.0.0.1:8000</p>
                <p className="text-xs text-amber-200/80 mt-1">
                  Make sure your backend server is running: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">.venv/bin/uvicorn main:app --reload --port 8000</code>
                </p>
                {backendError && <p className="text-xs text-amber-400 font-mono mt-1">Error: {backendError}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={checkBackendHealth}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-bold text-amber-200 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Form Validation Warning */}
        {formError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-xs text-rose-400 hover:text-white px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plans & Customer Info */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <PlanSelector
                selectedPlanId={selectedPlan.id}
                onSelectPlan={(plan) => setSelectedPlan(plan)}
                customAmount={customAmount}
                onCustomAmountChange={(amt) => setCustomAmount(amt)}
                isCustom={isCustom}
                onToggleCustom={(val) => setIsCustom(val)}
              />
            </section>

            <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <CustomerForm
                details={customer}
                onChange={setCustomer}
                disabled={isProcessing}
              />
            </section>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-5 sticky top-24">
            <OrderSummary
              planName={currentPlanName}
              amount={currentAmount}
              currency="INR"
              isProcessing={isProcessing}
              onPay={handlePayment}
              disabled={backendStatus === 'error'}
            />

            {/* Integration Details Info Box */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Layers className="w-4 h-4 text-indigo-400" />
                Integration Architecture
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li>Order created securely via <span className="font-mono text-indigo-300">POST /api/create-order</span></li>
                <li>Modal rendered with official Razorpay Standard Checkout SDK</li>
                <li>Signature validated by backend with <span className="font-mono text-indigo-300">POST /api/verify-payment</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Payment Gateway Integration • React Vite & FastAPI</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Razorpay Test Mode
            </span>
            <span>•</span>
            <span>FastAPI Server</span>
          </div>
        </div>
      </footer>

      {/* Payment Success / Failure Modal */}
      <PaymentStatusModal
        isOpen={modalOpen}
        status={paymentStatus}
        verificationResult={verificationResult}
        errorMessage={modalErrorMessage}
        amount={currentAmount}
        customerName={customer.fullName}
        onClose={() => {
          setModalOpen(false);
          setPaymentStatus(null);
          setVerificationResult(null);
          setModalErrorMessage('');
        }}
      />
    </div>
  );
}

export default App;
