const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUserPayload } = require('../services/UserService'); // Adjust path as needed

test('normalizeUserPayload fills defaults and cleans strings', () => {
  const payload = normalizeUserPayload({
    name: '  Ahmed Sameh  ',
    email: 'Ahmad.Sameh.Gad@gmail.com',
    password: 'securePassword123',
  });

  // Verify string cleaning and normalization
  assert.equal(payload.name, 'Ahmed Sameh'); // Should be trimmed
  assert.equal(payload.email, 'ahmad.sameh.gad@gmail.com'); // Should be lowercase

  // Verify defaults are set correctly
  assert.equal(payload.emailVerified, false);
  assert.equal(payload.verificationToken, undefined);
  assert.equal(payload.verificationOtp, undefined);
  assert.equal(payload.passwordResetToken, undefined);
});

test('normalizeUserPayload preserves custom verification fields when provided', () => {
  const futureDate = new Date();
  
  const payload = normalizeUserPayload({
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: true,
    verificationOtp: '123456',
    verificationOtpExpires: futureDate
  });

  assert.equal(payload.emailVerified, true);
  assert.equal(payload.verificationOtp, '123456');
  assert.equal(payload.verificationOtpExpires, futureDate);
});