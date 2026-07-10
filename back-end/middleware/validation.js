const { body, validationResult } = require('express-validator');

// Validation rules for signup
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('password_confirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

// Reset password validation
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('password_confirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().reduce((acc, err) => {
        acc[err.param] = acc[err.param] || [];
        acc[err.param].push(err.msg);
        return acc;
      }, {}),
    });
  }
  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validate,
};