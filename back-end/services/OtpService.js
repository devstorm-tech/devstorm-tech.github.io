const crypto = require('crypto');

function generateOtpCode() {
  return crypto.randomInt(0, 999999).toString().padStart(6, '0');
}

function isOtpExpired(expiresAt) {
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

module.exports = {
  generateOtpCode,
  isOtpExpired,
};
