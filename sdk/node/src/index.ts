import { PaymentsAPI } from './payments';
import { MerchantAPI } from './merchant';
import { WebhookUtils } from './webhooks';
import { SDKOptions } from './types';

export class SBTCGateway {
  public payments: PaymentsAPI;
  public merchant: MerchantAPI;
  public webhooks = WebhookUtils;

  constructor(apiKey: string, options: Partial<SDKOptions> = {}) {
    const sdkOptions: SDKOptions = {
      apiKey,
      baseURL: options.baseURL || 'https://api.sbtc-gateway.com',
      timeout: options.timeout || 30000,
      retries: options.retries || 3
    };

    this.payments = new PaymentsAPI(sdkOptions);
    this.merchant = new MerchantAPI(sdkOptions);
  }
}

// Export types and utilities
export * from './types';
export { SBTCGatewayError } from './base';
export { WebhookUtils } from './webhooks';

// Default export
export default SBTCGateway;
