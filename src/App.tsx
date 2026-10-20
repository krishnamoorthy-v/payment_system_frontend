import { useState, useEffect } from 'react';
import { ShieldCheck, Zap, AlertTriangle, RefreshCw, Repeat, Layers } from 'lucide-react';
import { PlanSelector } from './components/PlanSelector';
import { BillingCycleToggle } from './components/BillingCycleToggle';
import { CustomerForm } from './components/CustomerForm';
import { OrderSummary } from './components/OrderSummary';
import { PaymentStatusModal } from './components/PaymentStatusModal';
import { SubscriptionsManagerModal } from './components/SubscriptionsManagerModal';
import { apiService, ApiError } from './services/api';
import { loadRazorpayScript } from './utils/loadRazorpay';
import type {
  CustomerDetails,
  SubscriptionPlan,
  RazorpaySuccessResponse,
  VerifySubscriptionResponse,
} from './types/payment';

// Fallback plans in case backend is initialising
const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    plan_id: 'plan_fallback_starter_m',
    code: 'starter_monthly',
    name: 'Starter Plan',
    description: 'Essential tools for indie developers and micro-startups',
    amount: 499,
    amount_paise: 49900,
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    badge: 'Popular',
    popular: false,
    features: [
      'Up to 100 active transactions/mo',
      'UPI Autopay & Cards support',
      'Community Slack access',
      'Standard security compliance',
    ],
  },
  {
    plan_id: 'plan_fallback_starter_y',
    code: 'starter_yearly',
    name: 'Starter Plan (Annual)',
    description: 'Essential tools billed annually with 2 months free',
    amount: 4990,
    amount_paise: 499000,
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    badge: 'Save 17%',
    popular: false,
    features: [
      'All Starter Monthly features',
      '2 Months Free included',
      'Priority email alerts',
      'Annual consolidated tax invoice',
    ],
  },
  {
    plan_id: 'plan_fallback_pro_m',
    code: 'pro_monthly',
    name: 'Pro Scale',
    description: 'Advanced recurring gateway capabilities for growing businesses',
    amount: 1499,
    amount_paise: 149900,
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    badge: 'Recommended',
    popular: true,
    features: [
      'Unlimited recurring mandates',
      'Instant signature verification',
      'Priority 24/7 technical support',
      'Smart retry on billing failure',
      'Custom webhook destinations',
    ],
  },
  {
    plan_id: 'plan_fallback_pro_y',
    code: 'pro_yearly',
    name: 'Pro Scale (Annual)',
    description: 'Full Pro capabilities billed annually with 2 months free',
    amount: 14990,
    amount_paise: 1499000,
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    badge: 'Best Value (Save 17%)',
    popular: true,
    features: [
      'All Pro Monthly features',
      '2 Months Free included',
      'Dedicated Slack channel',
      'Webhook retry guarantees',
      'Advanced analytics export',
    ],
  },
  {
    plan_id: 'plan_fallback_ent_m',
    code: 'enterprise_monthly',
    name: 'Enterprise Hub',
    description: 'Full-scale custom volume payment gateway integration',
    amount: 4999,
    amount_paise: 499900,
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    badge: 'Enterprise',
    popular: false,
    features: [
      'Dedicated account manager',
      '99.99% SLA uptime guarantee',
      'Multi-currency processing',
      'Custom ledger & tax invoicing',
      'Automated reconciliation pipeline',
    ],
  },
  {
    plan_id: 'plan_fallback_ent_y',
    code: 'enterprise_yearly',
    name: 'Enterprise Hub (Annual)',
    description: 'Dedicated enterprise payment infrastructure billed annually',
    amount: 49990,
    amount_paise: 4999000,
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    badge: 'Enterprise Annual',
    popular: false,
    features: [
      'All Enterprise Monthly features',
      '2 Months Free included',
      'Dedicated solutions architect',
      'Quarterly security & compliance audit',
      'Custom webhook SLAs',
    ],
  },
];

export function App() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(FALLBACK_PLANS);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    FALLBACK_PLANS.find((p) => p.code === 'pro_monthly') || FALLBACK_PLANS[2]
  );

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: 'Krishna Sharma',
    email: 'krishna@example.com',
    phone: '9876543210',
  });

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendError, setBackendError] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [subsModalOpen, setSubsModalOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifySubscriptionResponse | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string>('');

  const loadPlansAndConfig = async () => {
    setBackendStatus('checking');
    setBackendError('');
    try {
      await apiService.getConfig();
      const planRes = await apiService.getPlans();
      if (planRes.plans && planRes.plans.length > 0) {
        setPlans(planRes.plans);
        // Find matching plan for current selection & period
        const matched = planRes.plans.find(
          (p) => p.period === period && (p.popular || p.code.includes('pro'))
        );
        if (matched) {
          setSelectedPlan(matched);
        } else {
          setSelectedPlan(planRes.plans[0]);
        }
      }
      setBackendStatus('connected');
    } catch (err: unknown) {
      setBackendStatus('error');
      const msg = err instanceof Error ? err.message : 'Cannot reach FastAPI backend';
      setBackendError(msg);
    }
  };

  useEffect(() => {
    loadPlansAndConfig();
    loadRazorpayScript();
  }, []);

  // When billing cycle toggle changes, switch selected plan to corresponding tier
  const handlePeriodChange = (newPeriod: 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    const tier = selectedPlan.code.replace('_monthly', '').replace('_yearly', '');
    const candidate = plans.find((p) => p.period === newPeriod && p.code.startsWith(tier));
    if (candidate) {
      setSelectedPlan(candidate);
    } else {
      const fallback = plans.find((p) => p.period === newPeriod);
      if (fallback) setSelectedPlan(fallback);
    }
  };

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
    if (!selectedPlan || selectedPlan.amount <= 0) {
      setFormError('Please select a valid subscription plan.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubscriptionPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setFormError(null);

    try {
      // 1. Ensure Razorpay SDK script is ready
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Checkout SDK. Please check your network connection.');
      }

      // 2. Request recurring subscription creation from FastAPI backend
      const subResponse = await apiService.createSubscription({
        plan_id: selectedPlan.plan_id || selectedPlan.code,
        customer: {
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
        notes: {
          customer_name: customer.fullName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          plan_code: selectedPlan.code,
          plan_name: selectedPlan.name,
          period: selectedPlan.period,
        },
      });

      // 3. Initialize Razorpay Checkout with subscription_id
      const options = {
        key: subResponse.key_id,
        name: 'Razorpay Subscriptions Hub',
        description: `${subResponse.plan_name} (${subResponse.period} billing)`,
        subscription_id: subResponse.subscription_id,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          subscription_id: subResponse.subscription_id,
          plan_code: subResponse.plan_code || selectedPlan.code,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            // 4. Send subscription payment signature to FastAPI backend for verification
            const verifyRes = await apiService.verifySubscription({
              razorpay_subscription_id: response.razorpay_subscription_id || subResponse.subscription_id,
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
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Subscription initiation failed';
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
                <h1 className="text-lg font-extrabold tracking-tight text-white">Razorpay Subscriptions</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  FastAPI
                </span>
              </div>
              <p className="text-xs text-slate-400">Recurring e-Mandates, UPI Autopay & Card Tokens</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSubsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-400" />
              <span>My Subscriptions</span>
            </button>

            {/* Backend Status Badge */}
            {backendStatus === 'connected' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>FastAPI Connected</span>
              </div>
            ) : backendStatus === 'checking' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking API...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={loadPlansAndConfig}
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1 w-full space-y-8">
        {/* Banner if backend is offline */}
        {backendStatus === 'error' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start justify-between gap-4">
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
              onClick={loadPlansAndConfig}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-bold text-amber-200 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Form Validation Warning */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
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

        {/* Hero Section with Billing Cycle Toggle */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Flexible Recurring Subscription Plans
          </h2>
          <p className="text-sm text-slate-400">
            Automated recurring billing powered by Razorpay Subscriptions. Supports UPI Autopay, Recurring Credit/Debit Cards, and NetBanking e-Mandates.
          </p>
          <BillingCycleToggle period={period} onChange={handlePeriodChange} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan Selector & Customer Info */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <PlanSelector
                plans={plans}
                selectedPlan={selectedPlan}
                onSelectPlan={(plan) => setSelectedPlan(plan)}
                period={period}
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

          {/* Right Column: Subscription Summary & Checkout */}
          <div className="lg:col-span-5 sticky top-24">
            <OrderSummary
              planName={selectedPlan.name}
              amount={selectedPlan.amount}
              period={period}
              currency="INR"
              isProcessing={isProcessing}
              onPay={handleSubscriptionPayment}
              disabled={backendStatus === 'error'}
            />

            {/* Integration Details Info Box */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Layers className="w-4 h-4 text-indigo-400" />
                Subscription Architecture
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li>Subscription initiated via <span className="font-mono text-indigo-300">POST /api/create-subscription</span></li>
                <li>Mandate authenticated via Razorpay Checkout SDK (<span className="font-mono text-indigo-300">subscription_id</span>)</li>
                <li>Signature cryptographically verified via <span className="font-mono text-indigo-300">POST /api/verify-subscription</span></li>
                <li>Automated renewal events handled via <span className="font-mono text-indigo-300">POST /api/webhooks/razorpay</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Razorpay Subscriptions Integration • React Vite & FastAPI</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Razorpay Test Mandates
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
        amount={selectedPlan.amount}
        period={period}
        planName={selectedPlan.name}
        customerName={customer.fullName}
        onOpenSubscriptions={() => setSubsModalOpen(true)}
        onClose={() => {
          setModalOpen(false);
          setPaymentStatus(null);
          setVerificationResult(null);
          setModalErrorMessage('');
        }}
      />

      {/* Subscriptions Management Modal */}
      <SubscriptionsManagerModal
        isOpen={subsModalOpen}
        onClose={() => setSubsModalOpen(false)}
      />
    </div>
  );
}

export default App;
