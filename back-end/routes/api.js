const express = require('express');
const AuthController = require('../controllers/AuthController');
const CourseController = require('../controllers/CourseController');
const UserController = require('../controllers/UserController');
const EmployeeRoleController = require('../controllers/EmployeeRoleController'); // Import the new controller
const auth = require('../middleware/auth');
const { ensureEmailIsVerified, isAdmin } = require('../middleware/ensureEmailIsVerified');
const { setCsrfCookie, validateCsrf } = require('../middleware/csrf');
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
router.get('/api/csrf-token', setCsrfCookie);

// Auth routes (registered via definitions + preflight checker)
const { preflightCheckAndRegister } = require('../utils/preflightRoutes');

const authRouteDefinitions = [
  {
    method: 'post',
    path: '/api/signup',
    handlers: [signupValidation, validate, validateCsrf, AuthController.signup],
  },
  {
    method: 'post',
    path: '/api/auth/register',
    handlers: [signupValidation, validate, validateCsrf, AuthController.signup],
  },
  {
    method: 'post',
    path: '/api/login',
    handlers: [loginValidation, validate, validateCsrf, AuthController.login],
  },
  {
    method: 'post',
    path: '/api/logout',
    handlers: [auth, validateCsrf, AuthController.logout],
  },
  {
    method: 'get',
    path: '/api/user',
    handlers: [auth, AuthController.getCurrentUser],
  },
  {
    method: 'post',
    path: '/api/verify-email',
    handlers: [validateCsrf, AuthController.verifyEmail],
  },
  {
    method: 'post',
    path: '/api/auth/verify-otp',
    handlers: [validateCsrf, AuthController.verifyOtp],
  },
];

preflightCheckAndRegister(router, authRouteDefinitions);

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
router.post('/api/courses', auth, validateCsrf, ensureEmailIsVerified, courseValidation, validate, CourseController.createCourse);
router.put('/api/courses/:id', auth, validateCsrf, ensureEmailIsVerified, courseValidation, validate, CourseController.updateCourse);
router.delete('/api/courses/:id', auth, validateCsrf, ensureEmailIsVerified, CourseController.deleteCourse);

// Admin-only routes
router.get('/api/admin/dashboard', auth, isAdmin, (req, res) => {
  res.status(200).json({ success: true, data: { message: 'Admin dashboard access granted', user: req.user } });
});

// User routes
router.get('/api/users', UserController.listUsers);
router.get('/api/users/:id', UserController.getUser);
router.post('/api/users', validateCsrf, UserController.createUser); 
router.put('/api/users/:id', validateCsrf, UserController.updateUser);
router.delete('/api/users/:id', validateCsrf, UserController.deleteUser);

// ==========================================
// Employee Role Routes (NEW)
// ==========================================
// Public/User accessible endpoint to fetch role definitions for UI dropdown lists
router.get('/api/employee-roles', EmployeeRoleController.getAllRoles);

module.exports = router;