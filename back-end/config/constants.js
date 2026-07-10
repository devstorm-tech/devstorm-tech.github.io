module.exports = {
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
  CSRF_COOKIE_OPTIONS: {
    httpOnly: false, // frontend must read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};