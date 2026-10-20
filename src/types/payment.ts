export interface ApiConfig {
  key_id: string;
  currency: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface SubscriptionPlan {
  plan_id: string;
  code: string;
  name: string;
  description: string;
  amount: number; // In INR (₹)
  amount_paise: number;
  currency: string;
  period: 'monthly' | 'yearly';
  interval: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  is_active?: boolean;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  total_count?: number;
  notes?: Record<string, string>;
}

export interface CreateSubscriptionResponse {
  subscription_id: string;
  plan_id: string;
  plan_code?: string;
  plan_name: string;
  period: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  total_count: number;
  key_id: string;
  short_url?: string;
}

export interface VerifySubscriptionRequest {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifySubscriptionResponse {
  status: 'success' | 'failed';
  message: string;
  subscription_id: string;
  payment_id: string;
}

export interface SubscriptionItem {
  subscription_id: string;
  plan_id: string;
  plan_code?: string;
  plan_name?: string;
  period: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  total_count: number;
  paid_count: number;
  payment_id?: string;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  status: 'success' | 'failed';
  message: string;
  order_id: string;
  payment_id: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id?: string;
    subscription_id?: string;
    payment_id?: string;
  };
}

export interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  subscription_id?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
    };
  }
}
