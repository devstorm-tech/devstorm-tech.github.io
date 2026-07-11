const crypto = require('crypto');
const { CSRF_COOKIE_OPTIONS } = require('../config/constants');

const getClientFingerprint = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown';
  return `${ip}:${req.headers['user-agent'] || 'unknown'}`;
};

const createToken = (seed, req) => crypto
  .createHmac('sha256', seed)
  .update(getClientFingerprint(req))
  .digest('hex');

// Middleware to set CSRF cookie and return a token
const setCsrfCookie = (req, res) => {
  const seed = req.cookies?.csrf_seed || crypto.randomBytes(32).toString('hex');
  const token = createToken(seed, req);

  res.cookie('csrf_seed', seed, {
    ...CSRF_COOKIE_OPTIONS,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ success: true, csrfToken: token });
};

const validateCsrf = (req, res, next) => {
  const method = (req.method || '').toUpperCase();
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);

  if (isSafeMethod) {
    return next();
  }

  const headerToken = req.get?.('x-csrf-token') || req.get?.('x-xsrf-token') || req.headers?.['x-csrf-token'] || req.headers?.['x-xsrf-token'];
  const cookieSeed = req.cookies?.csrf_seed;
  const tokenValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  // Diagnostic logging to help debug mismatches
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!cookieSeed || !tokenValue) {
    console.error(`[csrf] Missing token or seed: method=${method} path=${req.path} ip=${clientIp} headerPresent=${!!tokenValue} cookiePresent=${!!cookieSeed}`);
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  const expectedToken = createToken(cookieSeed, req);
  const expectedBuffer = Buffer.from(expectedToken, 'utf8');
  const suppliedBuffer = Buffer.from(tokenValue, 'utf8');

  if (expectedBuffer.length !== suppliedBuffer.length) {
    console.error(`[csrf] Token length mismatch: method=${method} path=${req.path} ip=${clientIp} expectedLen=${expectedBuffer.length} suppliedLen=${suppliedBuffer.length}`);
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  try {
    const ok = crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
    if (!ok) {
      console.error(`[csrf] Token mismatch after timingSafeEqual: method=${method} path=${req.path} ip=${clientIp}`);
      return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
    return next();
  } catch (error) {
    console.error(`[csrf] Token verification error: method=${method} path=${req.path} ip=${clientIp} err=${error && error.message}`);
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }
};

module.exports = { setCsrfCookie, validateCsrf };