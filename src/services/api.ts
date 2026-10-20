import type {
  ApiConfig,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  SubscriptionPlan,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  VerifySubscriptionRequest,
  VerifySubscriptionResponse,
  SubscriptionItem,
} from '../types/payment';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail: string;
    try {
      const data = await response.json();
      errorDetail = data.detail || data.message || JSON.stringify(data);
    } catch {
      errorDetail = (await response.text()) || 'Unknown API error';
    }
    throw new ApiError(response.status, errorDetail);
  }
  return response.json();
}

export const apiService = {
  async getConfig(): Promise<ApiConfig> {
    const res = await fetch(`${API_BASE}/api/config`);
    return handleResponse<ApiConfig>(res);
  },

  async getPlans(): Promise<{ plans: SubscriptionPlan[] }> {
    const res = await fetch(`${API_BASE}/api/plans`);
    return handleResponse<{ plans: SubscriptionPlan[] }>(res);
  },

  async createSubscription(payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const res = await fetch(`${API_BASE}/api/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreateSubscriptionResponse>(res);
  },

  async verifySubscription(payload: VerifySubscriptionRequest): Promise<VerifySubscriptionResponse> {
    const res = await fetch(`${API_BASE}/api/verify-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<VerifySubscriptionResponse>(res);
  },

  async getSubscriptions(status?: string): Promise<{ total: number; subscriptions: SubscriptionItem[] }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/api/subscriptions${query}`);
    return handleResponse<{ total: number; subscriptions: SubscriptionItem[] }>(res);
  },

  async getSubscriptionById(subscriptionId: string): Promise<{
    subscription: SubscriptionItem;
    payments: any[];
    live_razorpay?: any;
  }> {
    const res = await fetch(`${API_BASE}/api/subscriptions/${encodeURIComponent(subscriptionId)}`);
    return handleResponse<{
      subscription: SubscriptionItem;
      payments: any[];
      live_razorpay?: any;
    }>(res);
  },

  async cancelSubscription(subscriptionId: string): Promise<{
    status: string;
    message: string;
    subscription_id: string;
  }> {
    const res = await fetch(`${API_BASE}/api/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      method: 'POST',
    });
    return handleResponse<{
      status: string;
      message: string;
      subscription_id: string;
    }>(res);
  },

  // Legacy one-time orders
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const res = await fetch(`${API_BASE}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreateOrderResponse>(res);
  },

  async verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const res = await fetch(`${API_BASE}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<VerifyPaymentResponse>(res);
  },
};
