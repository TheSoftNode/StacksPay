import { 
  connect, 
  disconnect,
  request
} from '@stacks/connect';
import { 
  verifyMessageSignature
} from '@stacks/encryption';
import { 
  STACKS_TESTNET, 
  STACKS_MAINNET,
  StacksNetwork 
} from '@stacks/network';

// Extend window interface for wallet providers
declare global {
  interface Window {
    StacksProvider?: any;
    LeatherProvider?: any;
    XverseProviders?: any;
  }
}

export interface WalletConnectionResult {
  address: string;
  publicKey: string;
  profile?: any;
  isConnected: boolean;
  walletType: string;
  network: 'mainnet' | 'testnet';
}

export interface WalletSignatureResult {
  signature: string;
  publicKey: string;
  address: string;
  message: string;
}

export interface WalletAuthData {
  address: string;
  signature: string;
  message: string;
  publicKey: string;
  walletType: 'stacks';
  verified: boolean;
}

export interface WalletRegistrationData extends WalletAuthData {
  businessName: string;
  businessType: string;
  email?: string;
}

/**
 * WalletService - Frontend wallet connection and authentication
 * 
 * This service handles:
 * 1. Wallet connection (Stacks wallets like Leather, Xverse)
 * 2. Message signing for authentication
 * 3. Challenge retrieval from backend
 * 4. Registration and login flows with backend
 * 
 * The backend handles all signature verification and user management.
 */
class WalletService {
  private network: StacksNetwork;
  private baseURL: string;
  private appConfig = {
    name: 'StacksPay',
    icon: typeof window !== 'undefined' ? window.location.origin + '/icons/apple-touch-icon.png' : '',
  };

  constructor() {
    const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
    this.network = isMainnet ? STACKS_MAINNET : STACKS_TESTNET;
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  }

  /**
   * Connect to Stacks wallet - this ONLY handles wallet connection
   * Authentication with backend happens separately via API calls
   */
  async connectWallet(): Promise<WalletConnectionResult> {
    try {
      console.log('🔌 StacksPay: Connecting to Stacks wallet...');
      
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection requires browser environment');
      }

      // Check if wallet is already connected
      const existingData = this.extractWalletData();
      if (existingData) {
        console.log('✅ Using existing wallet connection');
        return {
          address: existingData.address,
          publicKey: existingData.publicKey,
          profile: existingData.profile,
          isConnected: true,
          walletType: this.detectWalletType(),
          network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet',
        };
      }

      // Use the modern connect API for Stacks addresses
      console.log('🔄 Initiating new wallet connection...');
      const result = await request('stx_getAddresses', {
        network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet'
      });

      if (!result.addresses || result.addresses.length === 0) {
        throw new Error('No Stacks addresses returned from wallet');
      }

      const stacksAddress = result.addresses[0];
      console.log('✅ Wallet connection successful:', stacksAddress);

      // Store connection data for future use
      const walletData: WalletConnectionResult = {
        address: stacksAddress.address,
        publicKey: stacksAddress.publicKey,
        isConnected: true,
        walletType: this.detectWalletType(),
        network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet',
      };

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('stacksWalletData', JSON.stringify(walletData));
      }

      console.log('✅ StacksPay wallet connected:', walletData);

      return walletData;

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  }

  /**
   * Extract wallet data from browser storage
   */
  private extractWalletData(): { address: string; publicKey: string; profile?: any } | null {
    try {
      if (typeof window === 'undefined') return null;

      // First check our custom localStorage (from modern connect API)
      const stored = localStorage.getItem('stacksWalletData');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.address && data.publicKey) {
          return {
            address: data.address,
            publicKey: data.publicKey,
            profile: data.profile || {}
          };
        }
      }

      // Fallback: Try legacy storage methods
      // Note: In modern API, we primarily rely on our custom storage
      const legacySession = localStorage.getItem('blockstack-session');
      if (legacySession) {
        const parsed = JSON.parse(legacySession);
        const userData = parsed.userData;
        
        if (userData && userData.profile) {
          const stxAddress = userData.profile.stxAddress;
          const publicKey = userData.profile.publicKey;

          if (!stxAddress || !publicKey) return null;

          // Get the appropriate address for current network
          const address = this.network === STACKS_MAINNET 
            ? stxAddress.mainnet 
            : stxAddress.testnet;

          if (!address) return null;

          return {
            address,
            publicKey,
            profile: userData.profile
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to extract wallet data:', error);
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      await disconnect();
      console.log('✅ StacksPay: Wallet disconnected');
    } catch (error) {
      console.error('❌ Wallet disconnection failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    try {
      const walletData = this.extractWalletData();
      return walletData !== null;
    } catch (error) {
      console.error('❌ Failed to check wallet connection:', error);
      return false;
    }
  }

  /**
   * Get current wallet data if connected
   */
  async getCurrentWalletData(): Promise<WalletConnectionResult | null> {
    try {
      const isConnected = await this.isWalletConnected();
      if (!isConnected) return null;

      const walletData = this.extractWalletData();
      if (!walletData) return null;

      return {
        address: walletData.address,
        publicKey: walletData.publicKey,
        profile: walletData.profile,
        isConnected: true,
        walletType: this.detectWalletType(),
        network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet',
      };
    } catch (error) {
      console.error('❌ Failed to get current wallet data:', error);
      return null;
    }
  }

  /**
   * Detect wallet type based on available providers
   */
  private detectWalletType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    if (window.LeatherProvider) return 'leather';
    if (window.XverseProviders) return 'xverse';
    if (window.StacksProvider) return 'stacks';
    
    return 'unknown';
  }

  /**
   * Sign a message with the connected wallet
   * This creates the signature that will be sent to backend for verification
   */
  async signMessage(message: string): Promise<WalletSignatureResult> {
    try {
      const walletData = await this.getCurrentWalletData();
      if (!walletData) {
        throw new Error('No wallet connected');
      }

      console.log('✍️ StacksPay: Signing message with wallet...');

      // Use the modern request API for message signing
      const result = await request('stx_signMessage', {
        message,
        publicKey: walletData.publicKey
      });

      console.log('✅ Message signed successfully');

      return {
        signature: result.signature,
        publicKey: result.publicKey,
        address: walletData.address,
        message: message,
      };

    } catch (error) {
      console.error('❌ Message signing failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign message');
    }
  }

  /**
   * Verify a message signature locally (optional verification before sending to backend)
   */
  verifySignature(message: string, signature: string, publicKey: string): boolean {
    try {
      return verifyMessageSignature({
        message,
        signature,
        publicKey,
      });
    } catch (error) {
      console.error('❌ Local signature verification failed:', error);
      return false;
    }
  }

  // =================================================================
  // BACKEND INTEGRATION METHODS
  // These methods interact with the backend API for authentication
  // =================================================================

  /**
   * Get challenge from backend for wallet authentication
   * The backend generates a unique challenge that the wallet must sign
   */
  private async getChallengeFromBackend(
    address: string, 
    type: 'connection' | 'payment' = 'connection',
    paymentId?: string,
    amount?: number
  ): Promise<{ challenge: string; expiresAt: string }> {
    try {
      console.log('🔄 Getting challenge from backend for address:', address);
      
      const params = new URLSearchParams({
        address,
        type,
        ...(paymentId && { paymentId }),
        ...(amount && { amount: amount.toString() }),
      });

      const response = await fetch(`${this.baseURL}/api/auth/wallet/challenge?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get challenge from backend');
      }

      console.log('✅ Challenge received from backend');
      return {
        challenge: data.challenge,
        expiresAt: data.expiresAt
      };
      
    } catch (error) {
      console.error('❌ Failed to get challenge from backend:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get authentication challenge');
    }
  }

  /**
   * Register new merchant with wallet authentication
   * This combines wallet connection, challenge signing, and backend registration
   */
  async registerWithWallet(businessName: string, businessType: string, email?: string): Promise<WalletAuthData> {
    try {
      console.log('🔄 Starting wallet registration...');

      // Step 1: Connect wallet
      const walletData = await this.connectWallet();
      console.log('✅ Wallet connected for registration');

      // Step 2: Get challenge from backend
      const { challenge } = await this.getChallengeFromBackend(walletData.address, 'connection');

      // Step 3: Sign the challenge
      const signatureData = await this.signMessage(challenge);

      // Step 4: Send registration data to backend
      const registrationData = {
        address: walletData.address,
        signature: signatureData.signature,
        message: challenge,
        publicKey: signatureData.publicKey,
        walletType: 'stacks' as const,
        businessName,
        businessType,
        email,
      };

      console.log('📤 Sending registration to backend...');
      const response = await fetch(`${this.baseURL}/api/auth/register/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || `Registration failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('✅ Wallet registration successful');
      return {
        address: walletData.address,
        signature: signatureData.signature,
        message: challenge,
        publicKey: signatureData.publicKey,
        walletType: 'stacks',
        verified: true,
      };
      
    } catch (error) {
      console.error('❌ Wallet registration failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to register with wallet');
    }
  }

  /**
   * Login with wallet authentication
   * This combines wallet connection, challenge signing, and backend login
   */
  async loginWithWallet(): Promise<WalletAuthData> {
    try {
      console.log('🔄 Starting wallet login...');

      // Step 1: Connect wallet (or use existing connection)
      const walletData = await this.connectWallet();
      console.log('✅ Wallet connected for login');

      // Step 2: Get challenge from backend
      const { challenge } = await this.getChallengeFromBackend(walletData.address, 'connection');

      // Step 3: Sign the challenge
      const signatureData = await this.signMessage(challenge);

      // Step 4: Send login data to backend
      const loginData = {
        address: walletData.address,
        signature: signatureData.signature,
        message: challenge,
        publicKey: signatureData.publicKey,
        walletType: 'stacks' as const,
      };

      console.log('📤 Sending login to backend...');
      const response = await fetch(`${this.baseURL}/api/auth/login/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || `Login failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      console.log('✅ Wallet login successful');
      return {
        address: walletData.address,
        signature: signatureData.signature,
        message: challenge,
        publicKey: signatureData.publicKey,
        walletType: 'stacks',
        verified: true,
      };
      
    } catch (error) {
      console.error('❌ Wallet login failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to login with wallet');
    }
  }

  /**
   * Verify wallet signature with backend
   * This is used for additional verification steps if needed
   */
  async verifyWithBackend(walletData: WalletAuthData): Promise<boolean> {
    try {
      console.log('🔄 Verifying signature with backend...');

      const response = await fetch(`${this.baseURL}/api/auth/wallet/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(errorData.error || `Verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Verification failed');
      }

      console.log('✅ Backend verification successful');
      return result.verified === true;
      
    } catch (error) {
      console.error('❌ Backend verification failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to verify with backend');
    }
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;
