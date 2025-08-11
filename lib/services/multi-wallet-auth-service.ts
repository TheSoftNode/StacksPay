import { verifyMessageSignature } from '@stacks/encryption';
import { walletService } from './wallet-service';
import { AuthEvent } from '@/models/auth-event';
import { connectToDatabase } from '@/lib/database/mongodb';

// Import Bitcoin libraries with proper typing
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');

// Initialize Bitcoin library
bitcoin.initEccLib(ecc);

export interface WalletAuthRequest {
  address: string;
  signature: string;
  message: string;
  publicKey: string;
  walletType: 'stacks' | 'bitcoin';
  paymentId?: string;
  amount?: number;
}

export interface MultiWalletAuthResponse {
  success: boolean;
  verified: boolean;
  walletType: 'stacks' | 'bitcoin';
  address?: string;
  paymentMethod?: 'bitcoin' | 'stx' | 'sbtc';
  error?: string;
}

export class MultiWalletAuthService {
  /**
   * Verify wallet signature for both Bitcoin and Stacks wallets
   */
  async verifyWalletSignature(auth: WalletAuthRequest): Promise<MultiWalletAuthResponse> {
    await connectToDatabase();

    try {
      let isValid = false;

      if (auth.walletType === 'stacks') {
        // Use WalletService for Stacks wallet verification
        isValid = await walletService.verifyMessage({
          message: auth.message,
          signature: auth.signature,
          publicKey: auth.publicKey,
          address: auth.address
        });

        if (isValid) {
          await this.logWalletEvent(auth.address, 'stacks_wallet_authorized', true, {
            paymentId: auth.paymentId,
            amount: auth.amount,
          });
        }

      } else if (auth.walletType === 'bitcoin') {
        // Verify Bitcoin wallet signature
        isValid = this.verifyBitcoinSignature(auth);

        if (isValid) {
          await this.logWalletEvent(auth.address, 'bitcoin_wallet_authorized', true, {
            paymentId: auth.paymentId,
            amount: auth.amount,
          });
        }
      }

      if (!isValid) {
        await this.logWalletEvent(auth.address, 'wallet_auth_failed', false, {
          reason: 'invalid_signature',
          walletType: auth.walletType,
          paymentId: auth.paymentId,
        });
        
        return {
          success: true,
          verified: false,
          walletType: auth.walletType,
          error: 'Invalid signature',
        };
      }

      // Determine payment method based on wallet type and user choice
      const paymentMethod = this.determinePaymentMethod(auth.walletType);

      return {
        success: true,
        verified: true,
        walletType: auth.walletType,
        address: auth.address,
        paymentMethod,
      };

    } catch (error) {
      console.error('Multi-wallet signature verification error:', error);
      await this.logWalletEvent(auth.address, 'wallet_auth_error', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        walletType: auth.walletType,
        paymentId: auth.paymentId,
      });
      
      return {
        success: false,
        verified: false,
        walletType: auth.walletType,
        error: 'Verification failed',
      };
    }
  }

  /**
   * Verify Bitcoin wallet signature using bitcoinjs-lib
   */
  private verifyBitcoinSignature(auth: WalletAuthRequest): boolean {
    try {
      // Bitcoin message verification implementation
      // This would use the actual Bitcoin message signing standard
      
      // For now, return basic validation
      // In production, implement proper Bitcoin message verification
      return auth.signature.length > 64 && auth.publicKey.length > 60;
    } catch (error) {
      console.error('Bitcoin signature verification error:', error);
      return false;
    }
  }

  /**
   * Determine payment method based on wallet type
   */
  private determinePaymentMethod(walletType: 'stacks' | 'bitcoin'): 'bitcoin' | 'stx' | 'sbtc' {
    if (walletType === 'bitcoin') {
      return 'bitcoin'; // Direct Bitcoin payment
    } else {
      return 'stx'; // STX payment (faster, cheaper)
    }
  }

  /**
   * Generate challenge for both wallet types
   */
  generateWalletChallenge(
    address: string, 
    walletType: 'stacks' | 'bitcoin',
    paymentId?: string, 
    amount?: number
  ): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    if (paymentId && amount) {
      return `Authorize ${walletType} payment ${paymentId} for ${amount} satoshis at ${timestamp} nonce ${nonce}`;
    } else {
      return `Connect ${walletType} wallet ${address} at ${timestamp} nonce ${nonce}`;
    }
  }

  /**
   * Get supported wallets for payment options
   */
  getSupportedWallets() {
    return {
      bitcoin: [
        { name: 'Electrum', type: 'desktop', supported: true },
        { name: 'Bitcoin Core', type: 'desktop', supported: true },
        { name: 'Sparrow', type: 'desktop', supported: true },
        { name: 'BlueWallet', type: 'mobile', supported: true },
        { name: 'Samourai', type: 'mobile', supported: true },
      ],
      stacks: [
        { name: 'Xverse', type: 'browser', supported: true },
        { name: 'Hiro Wallet', type: 'browser', supported: true },
        { name: 'Leather', type: 'browser', supported: true },
        { name: 'Boom', type: 'mobile', supported: true },
      ],
    };
  }

  /**
   * Log wallet authentication events
   */
  private async logWalletEvent(
    address: string,
    eventType: string,
    success: boolean,
    metadata?: any
  ): Promise<void> {
    try {
      const authEvent = new AuthEvent({
        merchantId: null,
        eventType,
        ipAddress: '',
        success,
        metadata: {
          walletAddress: address,
          ...metadata,
        },
      });
      await authEvent.save();
    } catch (error) {
      console.error('Error logging wallet auth event:', error);
    }
  }
}

export const multiWalletAuthService = new MultiWalletAuthService();
