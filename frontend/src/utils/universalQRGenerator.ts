// Universal QR Code Generator
// Generates QR codes that can be used by all payment gateways

export interface UniversalQRData {
  paymentId: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantId: string;
  paymentMethod: string;
  referenceId: string;
  description?: string;
  callbackUrl?: string;
}

export class UniversalQRGenerator {
  private static formatAmount(amount: number): string {
    return amount.toString().padStart(12, '0');
  }

  private static formatTimestamp(): string {
    return new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0];
  }

  private static generateUniversalString(data: UniversalQRData): string {
    const {
      paymentId,
      amount,
      currency,
      merchantName,
      merchantId,
      paymentMethod,
      referenceId,
      description,
      callbackUrl
    } = data;

    // Universal payment QR format that works with all gateways
    const qrData = {
      // Payment identification
      payment_id: paymentId,
      external_id: referenceId,
      
      // Amount and currency
      amount: this.formatAmount(amount),
      currency: currency,
      
      // Merchant info
      merchant_name: merchantName,
      merchant_id: merchantId,
      
      // Payment method
      payment_method: paymentMethod,
      
      // Additional info
      description: description || `Payment for ${merchantName}`,
      timestamp: this.formatTimestamp(),
      
      // Callback URL for payment confirmation
      callback_url: callbackUrl || `${window.location.origin}/payment/${paymentId}/callback`,
      
      // QR type indicator
      qr_type: 'universal_payment',
      version: '1.0'
    };

    // Convert to string format that can be parsed by payment apps
    return JSON.stringify(qrData);
  }

  static generatePaymentQR(paymentData: any): string {
    const universalData: UniversalQRData = {
      paymentId: paymentData.payment_id,
      amount: Math.round(paymentData.amount),
      currency: paymentData.currency || 'IDR',
      merchantName: 'GOMOMENT',
      merchantId: 'GOMOMENT001',
      paymentMethod: paymentData.payment_method || 'qris',
      referenceId: paymentData.external_id,
      description: `Event Registration - ${paymentData.event?.title || 'Event'}`,
      callbackUrl: `${window.location.origin}/payment/${paymentData.payment_id}/callback`
    };

    return this.generateUniversalString(universalData);
  }

  static generateQRISString(data: UniversalQRData): string {
    // Generate QRIS format for Indonesian e-wallets
    const qrString = [
      '000201', // Payload Format Indicator
      '010212', // Point of Initiation Method
      '26650010COM.QRIS.WWW', // Merchant Account Information
      `011893600${data.merchantId}`, // Merchant ID
      `0208QRIS${data.amount}`, // Transaction Amount
      '0303IDR', // Transaction Currency
      '5802ID', // Country Code
      `5913${data.merchantName}`, // Merchant Name
      `6007Jakarta`, // Merchant City
      `610512340`, // Postal Code
      '62070703A02', // Additional Data Field Template
      '6304' // CRC
    ].join('');

    // Add CRC checksum
    const crc = this.calculateCRC(qrString);
    return qrString + crc;
  }

  private static calculateCRC(input: string): string {
    // Simplified CRC calculation for demo
    let crc = 0xFFFF;
    for (let i = 0; i < input.length; i++) {
      crc ^= input.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x0001) {
          crc = (crc >> 1) ^ 0x8408;
        } else {
          crc >>= 1;
        }
      }
    }
    return (crc ^ 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  static generateDOKUQR(paymentData: any): string {
    // Generate DOKU-specific QR format
    const dokuData = {
      payment_id: paymentData.payment_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      merchant_id: 'EVENTHUB001',
      payment_method: 'qris',
      external_id: paymentData.external_id,
      gateway: 'doku',
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(dokuData);
  }

  static generateXenditQR(paymentData: any): string {
    // Generate Xendit-specific QR format
    const xenditData = {
      payment_id: paymentData.payment_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      merchant_id: 'EVENTHUB001',
      payment_method: 'qris',
      external_id: paymentData.external_id,
      gateway: 'xendit',
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(xenditData);
  }
}
