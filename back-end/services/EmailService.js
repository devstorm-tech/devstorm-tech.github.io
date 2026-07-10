const nodemailer = require('nodemailer');

class EmailService {
  static createTransporter() {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  static async sendVerificationEmail(email, name, otpCode) {
    const transporter = this.createTransporter();
    const mailOptions = {
      from: '"devStorm Academy" <verify@devstorm.dev>',
      to: email,
      subject: 'Your DevStorm verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Welcome to DevStorm, ${name || 'there'}!</h2>
          <p>Please use the following 6-digit verification code to confirm your email address:</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 24px 0; color: #2563eb;">${otpCode}</div>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not create an account with DevStorm, you can safely ignore this email.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  }

  static async sendPasswordResetEmail(email, token) {
    const transporter = this.createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: '"devStorm Academy" <contact@devstorm.dev>',
      to: email,
      subject: 'Password Reset - devStorm Academy',
      html: `
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;