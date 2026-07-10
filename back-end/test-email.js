const dotenv = require('dotenv');
// Initialize environmental variables exactly like your server does
dotenv.config(); 

const EmailService = require('./services/EmailService'); // Adjust path to your EmailService file if needed

async function runTest() {
  try {
    console.log('Sending test verification email via Brevo SMTP...');
    
    // Configured to send to your specified test account
    await EmailService.sendVerificationEmail(
      'ahmad.sameh.gad@gmail.com', 
      'Ahmed', 
      'test_token_123456'
    );
    
    console.log('Success! Check your inbox (and spam folder just in case).');
  } catch (error) {
    console.error('Email delivery failed:', error);
  }
}

runTest();