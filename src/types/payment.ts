export interface ApiConfig {
  key_id: string;
  currency: string;
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

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number; // In INR (₹)
  badge?: string;
  features: string[];
  popular?: boolean;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id?: string;
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
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
