const nodemailer = require('nodemailer');

class EmailService {
  static createTransporter() {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for port 465, false for other ports like 587
      auth: {
        user: process.env.EMAIL_USER, // Your Brevo identifier (b169d6001...)
        pass: process.env.EMAIL_PASS, // Your generated SMTP key
      },
    });
  }

  static async sendVerificationEmail(email, name, token) {
    const transporter = this.createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const mailOptions = {
      from: '"devStorm Academy" <contact@devstorm.dev>', 
      to: email,
      subject: 'Verify your email - devStorm Academy',
      html: `
        <h1>Welcome to devStorm Academy, ${name}!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
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