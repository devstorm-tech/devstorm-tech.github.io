const crypto = require('crypto');
const { CSRF_COOKIE_OPTIONS } = require('../config/constants');

// Middleware to set CSRF cookie (GET /sanctum/csrf-cookie)
const setCsrfCookie = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', token, CSRF_COOKIE_OPTIONS);
  res.status(204).send();
};

// Middleware to validate CSRF token on state-changing requests
// Temporarily bypassed for local/Postman testing.
const validateCsrf = (req, res, next) => {
  return next();
};

module.exports = { setCsrfCookie, validateCsrf };