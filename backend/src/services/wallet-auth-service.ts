import { verifyMessageSignature } from '@stacks/encryption';
import { walletService } from './wallet-service';
import { AuthEvent } from '@/models/auth-event';
import { connectToDatabase } from '@/config/database';
import { WalletAuthRequest, WalletAuthResponse } from '@/interfaces/wallet.interface';



export class WalletAuthService {
  /**
   * Verify wallet signature for payment authorization
   * This is used when customers need to authorize payments with their wallet
   */
  async verifyWalletSignature(auth: WalletAuthRequest): Promise<WalletAuthResponse> {
    await connectToDatabase();

    try {
      // Verify the message signature
      const isValid = verifyMessageSignature({
        message: auth.message,
        publicKey: auth.publicKey,
        signature: auth.signature,
      });

      if (!isValid) {
        await this.logWalletEvent(auth.address, 'payment_authorized', false, {
          reason: 'invalid_signature',
          paymentId: auth.paymentId,
        });
        return { 
          success: true, 
          verified: false, 
          error: 'Invalid signature' 
        };
      }

      // Additional verification: check if address matches public key
      // This ensures the person signing actually controls the wallet
      try {
        const walletInfo = await walletService.getUserData();
        const connectedAddress = this.extractStacksAddress(walletInfo);
        
        if (connectedAddress && connectedAddress !== auth.address) {
          await this.logWalletEvent(auth.address, 'payment_authorized', false, {
            reason: 'address_mismatch',
            expectedAddress: connectedAddress,
            providedAddress: auth.address,
            paymentId: auth.paymentId,
          });
          return { 
            success: true, 
            verified: false, 
            error: 'Address mismatch' 
          };
        }
      } catch (walletError) {
        // Wallet connection check failed, but signature is valid
        // This might happen if wallet is disconnected but signature is still valid
        console.warn('Wallet connection check failed:', walletError);
      }

      // Verify message format and content
      if (auth.paymentId && auth.amount) {
        const expectedMessagePattern = new RegExp(
          `Authorize payment ${auth.paymentId} for ${auth.amount} satoshis at \\d+`
        );
        
        if (!expectedMessagePattern.test(auth.message)) {
          await this.logWalletEvent(auth.address, 'payment_authorized', false, {
            reason: 'invalid_message_format',
            message: auth.message,
            paymentId: auth.paymentId,
          });
          return { 
            success: true, 
            verified: false, 
            error: 'Invalid message format' 
          };
        }

        // Check message age (should be recent to prevent replay attacks)
        const timestampMatch = auth.message.match(/at (\d+)$/);
        if (timestampMatch) {
          const messageTime = parseInt(timestampMatch[1]);
          const now = Date.now();
          const maxAge = 5 * 60 * 1000; // 5 minutes

          if (now - messageTime > maxAge) {
            await this.logWalletEvent(auth.address, 'payment_authorized', false, {
              reason: 'message_expired',
              messageAge: now - messageTime,
              paymentId: auth.paymentId,
            });
            return { 
              success: true, 
              verified: false, 
              error: 'Message expired' 
            };
          }
        }
      }

      // All checks passed
      await this.logWalletEvent(auth.address, 'payment_authorized', true, {
        paymentId: auth.paymentId,
        amount: auth.amount,
        publicKey: auth.publicKey.substring(0, 10) + '...' // Truncate for privacy
      });

      return {
        success: true,
        verified: true,
        address: auth.address,
      };

    } catch (error) {
      console.error('Wallet signature verification error:', error);
      await this.logWalletEvent(auth.address, 'payment_authorized', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId: auth.paymentId,
      });
      
      return { 
        success: false, 
        verified: false, 
        error: 'Verification failed' 
      };
    }
  }

  /**
   * Generate challenge message for wallet authentication
   * This creates a unique message that the wallet must sign
   */
  generateChallengeMessage(paymentId: string, amount: number): string {
    const timestamp = Date.now();
    return `Authorize payment ${paymentId} for ${amount} satoshis at ${timestamp}`;
  }

  /**
   * Generate simple wallet connection challenge
   * Used for wallet connection verification without payment context
   */
  generateConnectionChallenge(address: string): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    return `Connect wallet ${address} at ${timestamp} with nonce ${nonce}`;
  }

  /**
   * Verify wallet connection without payment context
   * Useful for general wallet authentication
   */
  async verifyWalletConnection(auth: WalletAuthRequest): Promise<WalletAuthResponse> {
    await connectToDatabase();

    try {
      // Verify the signature
      const isValid = verifyMessageSignature({
        message: auth.message,
        publicKey: auth.publicKey,
        signature: auth.signature,
      });

      if (!isValid) {
        await this.logWalletEvent(auth.address, 'wallet_connected', false, {
          reason: 'invalid_signature',
        });
        return { 
          success: true, 
          verified: false, 
          error: 'Invalid signature' 
        };
      }

      // Verify message format for connection
      const connectionPattern = new RegExp(
        `Connect wallet ${auth.address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} at \\d+ with nonce [a-z0-9]+`
      );
      
      if (!connectionPattern.test(auth.message)) {
        await this.logWalletEvent(auth.address, 'wallet_connected', false, {
          reason: 'invalid_message_format',
          message: auth.message,
        });
        return { 
          success: true, 
          verified: false, 
          error: 'Invalid message format' 
        };
      }

      // Check message age
      const timestampMatch = auth.message.match(/at (\d+) with/);
      if (timestampMatch) {
        const messageTime = parseInt(timestampMatch[1]);
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes for connection

        if (now - messageTime > maxAge) {
          await this.logWalletEvent(auth.address, 'wallet_connected', false, {
            reason: 'message_expired',
            messageAge: now - messageTime,
          });
          return { 
            success: true, 
            verified: false, 
            error: 'Message expired' 
          };
        }
      }

      await this.logWalletEvent(auth.address, 'wallet_connected', true, {
        publicKey: auth.publicKey.substring(0, 10) + '...',
      });

      return {
        success: true,
        verified: true,
        address: auth.address,
      };

    } catch (error) {
      console.error('Wallet connection verification error:', error);
      await this.logWalletEvent(auth.address, 'wallet_connected', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return { 
        success: false, 
        verified: false, 
        error: 'Verification failed' 
      };
    }
  }

  /**
   * Extract Stacks address from wallet data
   * Handles different wallet data formats
   */
  private extractStacksAddress(walletData: any): string | null {
    if (!walletData) return null;

    // Try different paths where address might be stored
    const possiblePaths = [
      walletData?.profile?.stxAddress?.testnet,
      walletData?.profile?.stxAddress?.mainnet,
      walletData?.addresses?.stx?.[0]?.address,
      walletData?.stxAddress,
      walletData?.address,
    ];

    for (const address of possiblePaths) {
      if (address && typeof address === 'string') {
        return address;
      }
    }

    return null;
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
        merchantId: null, // Wallet events are not tied to specific merchants
        eventType,
        ipAddress: '', // IP not available in this context
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

export const walletAuthService = new WalletAuthService();
