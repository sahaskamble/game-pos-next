import QRCode from 'qrcode';
import pbService from './pocketbase';

class QRService {
  async generateLoginQR(userId) {
    const payload = {
      type: 'login',
      userId,
      timestamp: Date.now(),
      token: this.generateToken()
    };
    
    return await QRCode.toDataURL(JSON.stringify(payload));
  }

  async verifyQRLogin(qrData) {
    try {
      const data = JSON.parse(qrData);
      if (data.type !== 'login') throw new Error('Invalid QR type');
      
      // Verify timestamp (QR valid for 5 minutes)
      if (Date.now() - data.timestamp > 300000) {
        throw new Error('QR code expired');
      }

      // Create staff login record
      await pbService.create('staff_logins', {
        user_id: data.userId,
        login_time: new Date().toISOString(),
        status: 'active'
      });

      return true;
    } catch (error) {
      console.error('QR Login Error:', error);
      return false;
    }
  }

  generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }
}

export const qrService = new QRService();