/**
 * QR Code generation utilities for payment addresses
 */

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate QR code data URL for STX payment
 */
export async function generateSTXPaymentQR(
  address: string, 
  amount: number, 
  memo?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Dynamically import QR code library to avoid SSR issues
    const QRCode = (await import('qrcode')).default;
    
    // Create STX payment URI
    let stxUri = `stx:${address}`;
    const params = new URLSearchParams();
    
    if (amount > 0) {
      // Amount in microSTX
      params.append('amount', amount.toString());
    }
    
    if (memo) {
      params.append('memo', memo);
    }
    
    if (params.toString()) {
      stxUri += `?${params.toString()}`;
    }
    
    // Generate QR code
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    const qrDataUrl = await QRCode.toDataURL(stxUri, qrOptions);
    return qrDataUrl;
    
  } catch (error) {
    console.error('Failed to generate STX payment QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code data URL for Bitcoin payment
 */
export async function generateBitcoinPaymentQR(
  address: string, 
  amount?: number, 
  label?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default;
    
    // Create Bitcoin payment URI
    let bitcoinUri = `bitcoin:${address}`;
    const params = new URLSearchParams();
    
    if (amount && amount > 0) {
      // Amount in BTC
      params.append('amount', amount.toString());
    }
    
    if (label) {
      params.append('label', label);
    }
    
    if (params.toString()) {
      bitcoinUri += `?${params.toString()}`;
    }
    
    // Generate QR code
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    const qrDataUrl = await QRCode.toDataURL(bitcoinUri, qrOptions);
    return qrDataUrl;
    
  } catch (error) {
    console.error('Failed to generate Bitcoin payment QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code for generic text/URL
 */
export async function generateGenericQR(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default;
    
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    const qrDataUrl = await QRCode.toDataURL(text, qrOptions);
    return qrDataUrl;
    
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Generate QR code based on payment method
 */
export async function generatePaymentQR(
  paymentMethod: string,
  address: string,
  amount: number,
  memo?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  switch (paymentMethod.toLowerCase()) {
    case 'stx':
      return generateSTXPaymentQR(address, amount, memo, options);
    
    case 'btc':
    case 'sbtc':
      // Convert from satoshis to BTC for Bitcoin URI
      const btcAmount = paymentMethod === 'btc' ? amount / 100000000 : amount;
      return generateBitcoinPaymentQR(address, btcAmount, memo, options);
    
    default:
      // Fallback to generic QR with address
      return generateGenericQR(address, options);
  }
}