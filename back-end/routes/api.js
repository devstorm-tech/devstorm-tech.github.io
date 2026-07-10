const express = require('express');
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const { setCsrfCookie } = require('../middleware/csrf');
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validate,
} = require('../middleware/validation');

const router = express.Router();

// CSRF cookie endpoint (like Laravel sanctum)
router.get('/sanctum/csrf-cookie', setCsrfCookie);

// Auth routes (CSRF validation temporarily bypassed for local/Postman testing)
router.post(
  '/api/signup',
  signupValidation,
  validate,
  AuthController.signup
);

router.post(
  '/api/login',
  loginValidation,
  validate,
  AuthController.login
);

router.post('/api/logout', auth, AuthController.logout);

router.get('/api/user', auth, AuthController.getCurrentUser);

router.post('/api/verify-email', AuthController.verifyEmail);

router.post(
  '/api/forgot-password',
  forgotPasswordValidation,
  validate,
  AuthController.forgotPassword
);

router.post(
  '/api/reset-password',
  resetPasswordValidation,
  validate,
  AuthController.resetPassword
);

module.exports = router;