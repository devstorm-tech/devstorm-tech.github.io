const express = require('express');
const AuthController = require('../controllers/AuthController');
const CourseController = require('../controllers/CourseController');
const UserController = require('../controllers/UserController')
const auth = require('../middleware/auth');
const { ensureEmailIsVerified, isAdmin } = require('../middleware/ensureEmailIsVerified');
const { setCsrfCookie } = require('../middleware/csrf');
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  userValidation,
  resetPasswordValidation,
  courseValidation,
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
router.post('/api/verify-email/confirm', AuthController.confirmEmail);

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

// Course routes
router.get('/api/courses', CourseController.listCourses);
router.get('/api/courses/:id', CourseController.getCourse);
router.get('/api/courses/slug/:slug', CourseController.getCourse);
router.post('/api/courses', auth, ensureEmailIsVerified, courseValidation, validate, CourseController.createCourse);
router.put('/api/courses/:id', auth, ensureEmailIsVerified, courseValidation, validate, CourseController.updateCourse);
router.delete('/api/courses/:id', auth, ensureEmailIsVerified, CourseController.deleteCourse);

// Admin-only routes
router.get('/api/admin/dashboard', auth, isAdmin, (req, res) => {
  res.status(200).json({ success: true, data: { message: 'Admin dashboard access granted', user: req.user } });
});

// User routes
router.get('/api/users', UserController.listUsers);
router.get('/api/users/:id', UserController.getUser);

router.post('/api/users', UserController.createUser); 

router.put('/api/users/:id', UserController.updateUser);
router.delete('/api/users/:id', UserController.deleteUser);


module.exports = router;