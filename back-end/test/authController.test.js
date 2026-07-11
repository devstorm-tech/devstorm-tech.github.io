const test = require('node:test');
const assert = require('node:assert/strict');
const AuthController = require('../controllers/AuthController');
const AuthService = require('../services/AuthService');

test('verifyOtp returns a 400 JSON payload for invalid verification codes', async () => {
  const originalVerifyOtp = AuthService.verifyOtp;
  AuthService.verifyOtp = async () => {
    throw Object.assign(new Error('Invalid or expired verification code. Please try again.'), { status: 400 });
  };

  try {
    let statusCode = null;
    let payload = null;

    const req = {
      body: {
        email: 'user@example.com',
        code: '123456',
        rememberMe: false,
      },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        payload = data;
        return this;
      },
    };

    await AuthController.verifyOtp(req, res, () => {
      throw new Error('next() should not be called for known validation errors');
    });

    assert.equal(statusCode, 400);
    assert.deepEqual(payload, {
      success: false,
      message: 'Invalid or expired verification code. Please try again.',
    });
  } finally {
    AuthService.verifyOtp = originalVerifyOtp;
  }
});
