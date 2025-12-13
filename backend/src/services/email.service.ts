import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface BookingEmailData {
  userName: string;
  spaceTitle: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingId: string;
}

interface VerificationEmailData {
  userName: string;
  verificationToken: string;
}

interface ReviewReminderData {
  userName: string;
  spaceTitle: string;
  bookingId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw error to prevent email failures from breaking the application
    }
  }

  async sendBookingConfirmation(to: string, data: BookingEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your parking space booking has been confirmed. Here are the details:</p>
              <div class="details">
                <p><strong>Parking Space:</strong> ${data.spaceTitle}</p>
                <p><strong>Start Time:</strong> ${data.startTime}</p>
                <p><strong>End Time:</strong> ${data.endTime}</p>
                <p><strong>Total Price:</strong> $${data.totalPrice.toFixed(2)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <p>Please arrive on time and follow the parking instructions provided by the space owner.</p>
              <a href="${process.env.FRONTEND_URL}/my-bookings" class="button">View My Bookings</a>
            </div>
            <div class="footer">
              <p>Thank you for using Shared Parking Platform</p>
              <p>If you have any questions, please contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Booking Confirmed - Shared Parking Platform',
      html,
    });
  }

  async sendBookingNotificationToOwner(to: string, data: BookingEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking Received!</h1>
            </div>
            <div class="content">
              <p>You have a new booking for your parking space:</p>
              <div class="details">
                <p><strong>Parking Space:</strong> ${data.spaceTitle}</p>
                <p><strong>Booked By:</strong> ${data.userName}</p>
                <p><strong>Start Time:</strong> ${data.startTime}</p>
                <p><strong>End Time:</strong> ${data.endTime}</p>
                <p><strong>Total Price:</strong> $${data.totalPrice.toFixed(2)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <a href="${process.env.FRONTEND_URL}/my-spaces" class="button">Manage Bookings</a>
            </div>
            <div class="footer">
              <p>Shared Parking Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'New Booking for Your Parking Space',
      html,
    });
  }

  async sendBookingCancellation(to: string, data: BookingEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your booking has been cancelled.</p>
              <div class="details">
                <p><strong>Parking Space:</strong> ${data.spaceTitle}</p>
                <p><strong>Start Time:</strong> ${data.startTime}</p>
                <p><strong>End Time:</strong> ${data.endTime}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <p>If payment was made, a refund will be processed within 5-10 business days.</p>
            </div>
            <div class="footer">
              <p>Shared Parking Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Booking Cancelled - Shared Parking Platform',
      html,
    });
  }

  async sendEmailVerification(to: string, data: VerificationEmailData): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${data.verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Thank you for registering with Shared Parking Platform!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>Welcome to Shared Parking Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Verify Your Email - Shared Parking Platform',
      html,
    });
  }

  async sendBookingReminder(to: string, data: BookingEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>This is a reminder that your parking booking starts soon!</p>
              <div class="details">
                <p><strong>Parking Space:</strong> ${data.spaceTitle}</p>
                <p><strong>Start Time:</strong> ${data.startTime}</p>
                <p><strong>End Time:</strong> ${data.endTime}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <p>Please make sure to arrive on time.</p>
            </div>
            <div class="footer">
              <p>Shared Parking Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Upcoming Booking Reminder - Shared Parking Platform',
      html,
    });
  }

  async sendReviewReminder(to: string, data: ReviewReminderData): Promise<void> {
    const reviewUrl = `${process.env.FRONTEND_URL}/my-bookings`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #9C27B0; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>How Was Your Experience?</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>We hope you had a great experience using <strong>${data.spaceTitle}</strong>!</p>
              <p>We'd love to hear your feedback. Your review helps other users make informed decisions.</p>
              <p style="text-align: center;">
                <a href="${reviewUrl}" class="button">Leave a Review</a>
              </p>
              <p>Thank you for using Shared Parking Platform!</p>
            </div>
            <div class="footer">
              <p>Shared Parking Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Share Your Experience - Shared Parking Platform',
      html,
    });
  }
}

export const emailService = new EmailService();
