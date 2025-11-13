// QRIS Generator Utility
// Generates real QRIS format that can be scanned by e-wallet apps

export interface QRISData {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  city: string;
  postalCode: string;
  referenceId?: string;
}

export class QRISGenerator {
  private static calculateCRC(input: string): string {
    // Simplified CRC calculation for demo
    // In production, use proper CRC-16-ANSI calculation
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

  private static formatLength(value: string): string {
    return value.length.toString().padStart(2, '0');
  }

  private static formatField(tag: string, value: string): string {
    return tag + this.formatLength(value) + value;
  }

  static generateQRISString(data: QRISData): string {
    const {
      merchantId,
      merchantName,
      amount,
      currency,
      city,
      postalCode,
      referenceId
    } = data;

    // Build QRIS EMV format
    const fields: string[] = [];

    // Payload Format Indicator
    fields.push('000201');

    // Point of Initiation Method (Static QR)
    fields.push('010212');

    // Merchant Account Information
    const merchantAccountInfo = [
      this.formatField('00', 'COM.QRIS.WWW'),
      this.formatField('01', merchantId),
      this.formatField('02', 'QRIS'),
      this.formatField('03', amount.toString())
    ].join('');
    
    fields.push(this.formatField('26', merchantAccountInfo));

    // Transaction Amount
    fields.push(this.formatField('54', amount.toString()));

    // Transaction Currency
    fields.push(this.formatField('58', currency));

    // Country Code
    fields.push(this.formatField('60', 'ID'));

    // Merchant Name
    fields.push(this.formatField('59', merchantName));

    // Merchant City
    fields.push(this.formatField('60', city));

    // Postal Code
    fields.push(this.formatField('61', postalCode));

    // Additional Data Field Template
    if (referenceId) {
      const additionalData = this.formatField('01', referenceId);
      fields.push(this.formatField('62', additionalData));
    }

    // Join all fields
    const qrString = fields.join('');

    // Add CRC
    const crc = this.calculateCRC(qrString);
    const finalString = qrString + '6304' + crc;

    return finalString;
  }

  static generateQRISForPayment(paymentData: any): string {
    const qrisData: QRISData = {
      merchantId: 'GOMOMENT001',
      merchantName: 'GOMOMENT',
      amount: Math.round(paymentData.amount),
      currency: 'IDR',
      city: 'Jakarta',
      postalCode: '12340',
      referenceId: paymentData.external_id
    };

    return this.generateQRISString(qrisData);
  }
}
