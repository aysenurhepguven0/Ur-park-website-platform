import twilio from 'twilio';
import logger from './logger.service';

interface SMSOptions {
  to: string;
  body: string;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      logger.info('Twilio SMS service initialized');
    } else {
      logger.warn('Twilio credentials not configured - SMS service disabled');
    }
  }

  /**
   * Send an SMS message
   */
  async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.client) {
      logger.warn('SMS service not configured, skipping SMS send');
      // In development, log the message instead
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[DEV SMS] To: ${options.to}, Body: ${options.body}`);
      }
      return false;
    }

    try {
      const message = await this.client.messages.create({
        body: options.body,
        from: this.fromNumber,
        to: options.to
      });

      logger.info(`SMS sent successfully: ${message.sid}`);
      return true;
    } catch (error: any) {
      logger.error('Error sending SMS:', error.message);
      return false;
    }
  }

  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send phone verification code
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const body = `Your Shared Parking verification code is: ${code}. This code expires in 10 minutes.`;
    return this.sendSMS({ to: phoneNumber, body });
  }

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmation(
    phoneNumber: string,
    data: { spaceTitle: string; startTime: string; bookingId: string }
  ): Promise<boolean> {
    const body = `Booking confirmed! Your parking at "${data.spaceTitle}" starts on ${data.startTime}. Booking ID: ${data.bookingId}`;
    return this.sendSMS({ to: phoneNumber, body });
  }

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminder(
    phoneNumber: string,
    data: { spaceTitle: string; startTime: string }
  ): Promise<boolean> {
    const body = `Reminder: Your parking at "${data.spaceTitle}" starts on ${data.startTime}. Don't forget!`;
    return this.sendSMS({ to: phoneNumber, body });
  }

  /**
   * Format phone number to E.164 format
   * Assumes US numbers if no country code provided
   */
  formatPhoneNumber(phone: string, defaultCountryCode: string = '+1'): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it starts with +, assume it's already formatted
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // If it's 10 digits (US number without country code), add +1
    if (cleaned.length === 10) {
      return defaultCountryCode + cleaned;
    }

    // If it's 11 digits starting with 1 (US number with country code), add +
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return '+' + cleaned;
    }

    // Otherwise, add default country code
    return defaultCountryCode + cleaned;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    // Basic validation for E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const formatted = this.formatPhoneNumber(phone);
    return e164Regex.test(formatted);
  }
}

export const smsService = new SMSService();
export default smsService;
