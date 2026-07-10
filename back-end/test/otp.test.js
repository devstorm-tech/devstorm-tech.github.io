const test = require('node:test');
const assert = require('node:assert/strict');
const { generateOtpCode, isOtpExpired } = require('../services/OtpService');

test('generateOtpCode returns a 6-digit code', () => {
  const code = generateOtpCode();

  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test('isOtpExpired returns true for a past expiration timestamp', () => {
  const expiredAt = new Date(Date.now() - 1000);

  assert.equal(isOtpExpired(expiredAt), true);
});

test('isOtpExpired returns false for a future expiration timestamp', () => {
  const validAt = new Date(Date.now() + 60 * 1000);

  assert.equal(isOtpExpired(validAt), false);
});
