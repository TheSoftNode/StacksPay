export interface PaymentRequest {
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
  expiresIn?: number; // minutes
  redirectUrl?: string;
}

export interface Payment {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bitcoinAddress?: string;
  transactionId?: string;
  confirmations: number;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
