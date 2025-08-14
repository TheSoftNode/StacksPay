import { connectToDatabase } from '@/lib/database/mongodb';
import { Merchant } from '@/models/merchant';
import { webhookService } from './webhook-service';

export interface MerchantData {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  website?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  stacksAddress?: string;
  bitcoinAddress?: string;
  walletSetup?: {
    stacksAddress: string;
    bitcoinAddress: string;
    walletProvider: string;
    isConfigured: boolean;
  };
  apiKeys: ApiKey[];
  settings: MerchantSettings;
  verification: MerchantVerification;
  subscription: MerchantSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  permissions: string[];
  lastUsed?: Date;
  createdAt: Date;
}

export interface MerchantSettings {
  webhookUrls: {
    payment?: string;
    subscription?: string;
    general?: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  paymentMethods: {
    bitcoin: boolean;
    stx: boolean;
    sbtc: boolean;
  };
  autoConvert: {
    enabled: boolean;
    targetCurrency: 'USD' | 'USDC' | 'sBTC';
  };
  feeTier: 'starter' | 'professional' | 'enterprise';
}

export interface MerchantVerification {
  email: boolean;
  phone: boolean;
  business: boolean;
  kyc: boolean;
  wallet: boolean;
  status: 'pending' | 'verified' | 'rejected';
}

export interface MerchantSubscription {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  features: string[];
}

export interface MerchantMetrics {
  totalPayments: number;
  totalVolume: number;
  totalRevenue: number;
  successRate: number;
  averageTransactionValue: number;
  topPaymentMethod: string;
  monthlyGrowth: number;
  customerCount: number;
}

export interface WalletSetupOptions {
  merchantId: string;
  stacksAddress?: string;
  bitcoinAddress?: string;
  walletProvider: 'hiro' | 'xverse' | 'leather' | 'asigna' | 'other';
  signatureProof?: string;
}

/**
 * Merchant Service - Centralized merchant management
 * 
 * Handles all merchant-related operations including:
 * - Merchant profile management
 * - Wallet setup and verification
 * - API key management
 * - Settings and preferences
 * - Onboarding workflow
 * - Business verification
 */
export class MerchantService {
  
  /**
   * Get merchant by ID
   */
  async getMerchant(merchantId: string): Promise<MerchantData | null> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return null;
      }

      return this.formatMerchantData(merchant);
    } catch (error) {
      console.error('Error getting merchant:', error);
      return null;
    }
  }

  /**
   * Get merchant by email
   */
  async getMerchantByEmail(email: string): Promise<MerchantData | null> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findOne({ email });
      if (!merchant) {
        return null;
      }

      return this.formatMerchantData(merchant);
    } catch (error) {
      console.error('Error getting merchant by email:', error);
      return null;
    }
  }

  /**
   * Update merchant profile
   */
  async updateMerchant(merchantId: string, updates: Partial<MerchantData>): Promise<{ success: boolean; merchant?: MerchantData; error?: string }> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findByIdAndUpdate(
        merchantId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      const formattedMerchant = this.formatMerchantData(merchant);

      // Trigger webhook for merchant update
      await webhookService.triggerWebhook({
        urls: { webhook: merchant.settings?.webhookUrls?.general },
        _id: merchantId,
        type: 'merchant',
        data: formattedMerchant,
        metadata: { updatedFields: Object.keys(updates) }
      }, 'merchant.updated');

      return { success: true, merchant: formattedMerchant };
    } catch (error) {
      console.error('Error updating merchant:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      };
    }
  }

  /**
   * Setup merchant wallet
   */
  async setupWallet(options: WalletSetupOptions): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findById(options.merchantId);
      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      // Validate addresses if provided
      if (options.stacksAddress && !this.isValidStacksAddress(options.stacksAddress)) {
        return { success: false, error: 'Invalid Stacks address' };
      }

      if (options.bitcoinAddress && !this.isValidBitcoinAddress(options.bitcoinAddress)) {
        return { success: false, error: 'Invalid Bitcoin address' };
      }

      // Update wallet setup
      const walletSetup = {
        stacksAddress: options.stacksAddress || merchant.walletSetup?.stacksAddress,
        bitcoinAddress: options.bitcoinAddress || merchant.walletSetup?.bitcoinAddress,
        walletProvider: options.walletProvider,
        isConfigured: true,
        configuredAt: new Date(),
      };

      merchant.walletSetup = walletSetup;
      merchant.stacksAddress = options.stacksAddress || merchant.stacksAddress;
      merchant.verification.wallet = true;
      merchant.updatedAt = new Date();

      await merchant.save();

      // Trigger webhook
      await webhookService.triggerWebhook({
        urls: { webhook: merchant.settings?.webhookUrls?.general },
        _id: options.merchantId,
        type: 'merchant',
        data: { walletSetup },
        metadata: { action: 'wallet_setup' }
      }, 'merchant.wallet.configured');

      return { success: true };
    } catch (error) {
      console.error('Error setting up wallet:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Wallet setup failed' 
      };
    }
  }

  /**
   * Update merchant settings
   */
  async updateSettings(merchantId: string, settings: Partial<MerchantSettings>): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      // Merge with existing settings
      merchant.settings = {
        ...merchant.settings,
        ...settings,
      };
      merchant.updatedAt = new Date();

      await merchant.save();

      // Trigger webhook
      await webhookService.triggerWebhook({
        urls: { webhook: merchant.settings?.webhookUrls?.general },
        _id: merchantId,
        type: 'merchant',
        data: { settings: merchant.settings },
        metadata: { action: 'settings_updated' }
      }, 'merchant.settings.updated');

      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Settings update failed' 
      };
    }
  }

  /**
   * Get merchant metrics
   */
  async getMerchantMetrics(merchantId: string, startDate?: Date, endDate?: Date): Promise<MerchantMetrics> {
    await connectToDatabase();
    
    try {
      // In production, this would aggregate from payments, subscriptions, etc.
      // For now, returning placeholder metrics
      return {
        totalPayments: 247,
        totalVolume: 125000, // $1,250.00
        totalRevenue: 3125, // $31.25 (2.5% fee)
        successRate: 94.5,
        averageTransactionValue: 506, // $5.06
        topPaymentMethod: 'sbtc',
        monthlyGrowth: 23.5,
        customerCount: 89,
      };
    } catch (error) {
      console.error('Error getting merchant metrics:', error);
      return {
        totalPayments: 0,
        totalVolume: 0,
        totalRevenue: 0,
        successRate: 0,
        averageTransactionValue: 0,
        topPaymentMethod: 'sbtc',
        monthlyGrowth: 0,
        customerCount: 0,
      };
    }
  }

  /**
   * List merchants (admin function)
   */
  async listMerchants(options: {
    page?: number;
    limit?: number;
    verified?: boolean;
    status?: string;
  } = {}): Promise<{
    merchants: MerchantData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    await connectToDatabase();
    
    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 50, 100);
      const skip = (page - 1) * limit;

      const query: any = {};
      if (options.verified !== undefined) {
        query['verification.status'] = options.verified ? 'verified' : { $ne: 'verified' };
      }

      const merchants = await Merchant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Merchant.countDocuments(query);

      return {
        merchants: merchants.map(merchant => this.formatMerchantData(merchant)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error listing merchants:', error);
      return {
        merchants: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
      };
    }
  }

  /**
   * Verify merchant business information
   */
  async verifyBusiness(merchantId: string, verificationData: any): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      // In production, this would integrate with KYC/business verification services
      merchant.verification.business = true;
      merchant.verification.kyc = true;
      merchant.verification.status = 'verified';
      merchant.updatedAt = new Date();

      await merchant.save();

      // Trigger webhook
      await webhookService.triggerWebhook({
        urls: { webhook: merchant.settings?.webhookUrls?.general },
        _id: merchantId,
        type: 'merchant',
        data: { verification: merchant.verification },
        metadata: { action: 'business_verified' }
      }, 'merchant.verified');

      return { success: true };
    } catch (error) {
      console.error('Error verifying business:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  /**
   * Suspend merchant account
   */
  async suspendMerchant(merchantId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();
    
    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      merchant.subscription.status = 'suspended';
      merchant.updatedAt = new Date();

      await merchant.save();

      // Trigger webhook
      await webhookService.triggerWebhook({
        urls: { webhook: merchant.settings?.webhookUrls?.general },
        _id: merchantId,
        type: 'merchant',
        data: { status: 'suspended', reason },
        metadata: { action: 'account_suspended' }
      }, 'merchant.suspended');

      return { success: true };
    } catch (error) {
      console.error('Error suspending merchant:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Suspension failed' 
      };
    }
  }

  /**
   * Format merchant data for API responses
   */
  private formatMerchantData(merchant: any): MerchantData {
    return {
      id: merchant._id.toString(),
      name: merchant.name,
      email: merchant.email,
      businessName: merchant.businessName || merchant.name,
      businessType: merchant.businessType || 'individual',
      website: merchant.website,
      phone: merchant.phone,
      address: merchant.address,
      stacksAddress: merchant.stacksAddress,
      bitcoinAddress: merchant.bitcoinAddress,
      walletSetup: merchant.walletSetup,
      apiKeys: merchant.apiKeys || [],
      settings: merchant.settings || this.getDefaultSettings(),
      verification: merchant.verification || this.getDefaultVerification(),
      subscription: merchant.subscription || this.getDefaultSubscription(),
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    };
  }

  /**
   * Default merchant settings
   */
  private getDefaultSettings(): MerchantSettings {
    return {
      webhookUrls: {},
      notifications: {
        email: true,
        sms: false,
        webhook: true,
      },
      paymentMethods: {
        bitcoin: true,
        stx: true,
        sbtc: true,
      },
      autoConvert: {
        enabled: false,
        targetCurrency: 'sBTC',
      },
      feeTier: 'starter',
    };
  }

  /**
   * Default verification status
   */
  private getDefaultVerification(): MerchantVerification {
    return {
      email: false,
      phone: false,
      business: false,
      kyc: false,
      wallet: false,
      status: 'pending',
    };
  }

  /**
   * Default subscription
   */
  private getDefaultSubscription(): MerchantSubscription {
    return {
      plan: 'free',
      status: 'active',
      billingCycle: 'monthly',
      features: ['basic_payments', 'api_access'],
    };
  }

  /**
   * Validate Stacks address
   */
  private isValidStacksAddress(address: string): boolean {
    // Basic Stacks address validation (SP/SM prefix + 39 characters)
    return /^S[PM][0-9A-Z]{39}$/.test(address);
  }

  /**
   * Validate Bitcoin address
   */
  private isValidBitcoinAddress(address: string): boolean {
    // Basic Bitcoin address validation (simplified)
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || // P2PKH/P2SH
           /^bc1[a-z0-9]{39,59}$/.test(address); // Bech32
  }
}

export const merchantService = new MerchantService();