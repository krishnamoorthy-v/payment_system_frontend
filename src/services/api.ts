import type {
  ApiConfig,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
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
