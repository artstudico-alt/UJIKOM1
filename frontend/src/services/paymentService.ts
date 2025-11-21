import api from './api';

export interface PaymentMethod {
  name: string;
  channels: Record<string, string>;
  fee?: number;
  fee_percentage?: number;
}

export interface PaymentMethods {
  virtual_account: PaymentMethod;
  ewallet: PaymentMethod;
  qris: PaymentMethod;
}

export interface Payment {
  id: number;
  user_id: number;
  event_id: number;
  invoice_number: string;
  amount: number;
  payment_method: string;
  payment_channel: string;
  payment_status: 'pending' | 'success' | 'failed' | 'expired';
  doku_transaction_id?: string;
  doku_payment_code?: string;
  payment_url?: string;
  qr_code_url?: string;
  payment_instructions?: any;
  expired_at?: string;
  paid_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  event?: any;
  user?: any;
}

export interface CreatePaymentRequest {
  event_id: number;
  payment_method: string;
  payment_channel: string;
}

export interface CreateUpgradePaymentRequest {
  payment_method: string;
  payment_channel: string;
  amount: number;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    amount_details: {
      base_amount: number;
      fee: number;
      total_amount: number;
    };
    event: {
      id: number;
      title: string;
      price: number;
    };
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data: Payment;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const paymentService = {
  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethods> {
    const response = await api.get('/payments/methods');
    return response.data.data;
  },

  /**
   * Create payment for event
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.post('/payments/create', data);
    console.log('🔷 paymentService - Raw axios response:', response);
    console.log('🔷 paymentService - response.data:', response.data);
    return response.data;
  },

  /**
   * Create payment for account upgrade to Event Organizer
   */
  async createUpgradePayment(data: CreateUpgradePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.post('/payments/upgrade', data);
    return response.data;
  },

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceNumber: string): Promise<PaymentStatusResponse> {
    const response = await api.get(`/payments/${invoiceNumber}/status`);
    return response.data;
  },

  /**
   * Get user payment history
   */
  async getPaymentHistory(page: number = 1): Promise<PaymentHistoryResponse> {
    const response = await api.get(`/payments/history?page=${page}`);
    return response.data;
  },

  /**
   * Cancel pending payment
   */
  async cancelPayment(invoiceNumber: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/payments/${invoiceNumber}/cancel`);
    return response.data;
  },

  /**
   * Format currency to IDR
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      virtual_account: '🏦',
      ewallet: '💳',
      qris: '📱',
      bca: '🏦',
      mandiri: '🏦',
      bni: '🏦',
      bri: '🏦',
      permata: '🏦',
      ovo: '🟠',
      dana: '🔵',
      linkaja: '🔴',
      shopeepay: '🟠',
    };
    return icons[method.toLowerCase()] || '💰';
  },

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#ff9800',
      success: '#4caf50',
      failed: '#f44336',
      expired: '#9e9e9e',
    };
    return colors[status] || '#666';
  },

  /**
   * Get payment status label
   */
  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Menunggu Pembayaran',
      success: 'Berhasil',
      failed: 'Gagal',
      expired: 'Kadaluarsa',
    };
    return labels[status] || status;
  },
};

export default paymentService;
