import type { PaymentPlan } from '../types/payment';

export const DEFAULT_PLANS: PaymentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Essential payment tools for hobbyists & indie developers',
    amount: 499,
    badge: 'Popular',
    features: ['Up to 50 transactions/mo', 'Standard webhook events', 'Community support', 'Basic analytics'],
  },
  {
    id: 'pro',
    name: 'Pro Scale',
    description: 'Advanced gateway capabilities for growing businesses',
    amount: 1499,
    badge: 'Recommended',
    popular: true,
    features: [
      'Unlimited transactions',
      'Instant signature verification',
      'Priority 24/7 support',
      'Advanced fraud detection',
      'Custom webhook destinations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Hub',
    description: 'Full-scale custom volume payment gateway integration',
    amount: 4999,
    features: [
      'Dedicated account manager',
      '99.99% SLA uptime guarantee',
      'Multi-currency processing',
      'Custom ledger & tax invoicing',
      'Automated reconciliation',
    ],
  },
];
