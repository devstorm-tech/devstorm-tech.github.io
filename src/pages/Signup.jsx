import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        newsletter: true
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:8000';
    const API_BASE_URL = `${API_ROOT_URL}/api`;

    const apiClient = axios.create({
        baseURL: API_ROOT_URL,
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear errors when user types
        if (error) setError('');
        if (success) setSuccess('');
    };

    const saveAuthData = (authData) => {
        try {
            const userData = authData.user;
            const userId = userData.id || userData.user_id || userData._id;
            
            if (!userId) {
                console.error('User ID not found in auth response');
                setError('Registration failed: User information missing');
                return;
            }

            if (formData.rememberMe) {
                // For "Remember Me": Save in cookies with 7-day expiration
                const expires = new Date();
                expires.setDate(expires.getDate() + 7);
                
                // Save authentication data in cookies (persistent for 7 days)
                Cookies.set('auth_token', authData.token, {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_id', userId.toString(), {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('token_type', authData.token_type, {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('token_expires', authData.expires_at, {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_data', JSON.stringify(userData), {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('remember_me', 'true', {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                console.log('Persistent auth data saved for new user. User ID:', userId);
                
            } else {
                // For session-only: Save in sessionStorage and temporary cookies
                sessionStorage.setItem('user_id', userId.toString());
                sessionStorage.setItem('auth_token', authData.token);
                sessionStorage.setItem('user_data', JSON.stringify(userData));
                sessionStorage.setItem('is_session_only', 'true');
                
                // Save in cookies but with session flag (expires when browser closes)
                Cookies.set('user_id', userId.toString(), {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('auth_token', authData.token, {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_data', JSON.stringify(userData), {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                console.log('Session-only auth data saved for new user. User ID:', userId);
            }
            
            // Save login timestamp and method
            const loginTime = new Date().toISOString();
            sessionStorage.setItem('login_time', loginTime);
            sessionStorage.setItem('auth_method', 'signup');
            
            // Save user ID and data in localStorage for quick access
            localStorage.setItem('user_id', userId.toString());
            localStorage.setItem('user', JSON.stringify(userData));
            
        } catch (error) {
            console.error('Error saving auth data:', error);
            setError('Failed to save authentication data');
        }
    };

    const validateForm = () => {
        // Reset errors
        setError('');
        
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return false;
        }
        
        // Check password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        
        // Check name
        if (formData.name.trim().length < 2) {
            setError('Please enter your full name');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Prepare data for API
            const signupData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                password_confirmation: formData.confirmPassword
            };
            
            console.log('Sending signup request:', signupData);
            
            // Get CSRF cookie before signup to support Laravel Sanctum and cross-site cookies
            await apiClient.get('/sanctum/csrf-cookie');
            
            // Make API call
            const response = await apiClient.post('/api/signup', signupData);
            
            console.log('Signup response:', response.data);
            
            if (response.data.success) {
                // Extract user ID from response
                const userData = response.data.data.user;
                const userId = userData.id || userData.user_id || userData._id;
                
                if (!userId) {
                    throw new Error('User ID not found in response');
                }
                
                setSuccess('Registration successful! Welcome to DevStorm. Redirecting...');
                
                // Save auth data (cookies + session)
                saveAuthData({
                    token: response.data.data.auth.token,
                    token_type: response.data.data.auth.token_type,
                    expires_at: response.data.data.auth.expires_at,
                    user: userData
                });
                
                // Set authorization header for future requests
                const token = response.data.data.auth.token;
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Save token in axios instance for immediate use
                sessionStorage.setItem('api_token', token);
                
                // Trigger auth status change for header update
                window.dispatchEvent(new CustomEvent('authChange', {
                    detail: { userId: userId }
                }));
                
                // Show success message for 2 seconds then redirect
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
                
            } else {
                setError(response.data.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 422) {
                    // Validation errors
                    const validationErrors = error.response.data.errors;
                    const errorMessages = [];
                    
                    for (const field in validationErrors) {
                        errorMessages.push(...validationErrors[field]);
                    }
                    
                    setError(errorMessages.join(', '));
                } else if (error.response.status === 409) {
                    setError('Email already registered. Please login instead.');
                } else if (error.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(error.response.data.message || 'Registration failed');
                }
            } else if (error.request) {
                // Request made but no response
                setError('Network error. Please check your connection.');
            } else {
                // Something else happened
                setError(error.message || 'An error occurred. Please try again.');
            }
            
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignup = (provider) => {
        // Placeholder for social login functionality
        alert(`Social signup with ${provider} is coming soon!`);
    };

    return (
        <div className="auth-page">
            {/* Background gradients */}
            <div className="auth-background">
                <div className="gradient-circle gradient-1"></div>
                <div className="gradient-circle gradient-2"></div>
                <div className="gradient-circle gradient-3"></div>
            </div>

            <div className="container">
                <div className="auth-wrapper">
                    {/* Left side - Brand/Info */}
                    <div className="auth-side">
                        <div className="auth-brand">
                            <div className="logo-icon">DevStorm</div>
                            <div className="logo-text">DevStorm</div>
                        </div>
                        <h1 className="auth-side-title">Join DevStorm</h1>
                        <p className="auth-side-text">
                            Start your programming journey today. Get access to all courses, 
                            DevStorm Cloud Linux, online compilers, and a supportive community.
                        </p>
                        <div className="auth-benefits">
                            <h3>What you'll get:</h3>
                            <ul className="benefits-list">
                                <li><i className="fas fa-check-circle"></i> Access to 100+ courses</li>
                                <li><i className="fas fa-check-circle"></i> DevStorm Cloud Linux (DCL)</li>
                                <li><i className="fas fa-check-circle"></i> Online compilers & IDE</li>
                                <li><i className="fas fa-check-circle"></i> Security testing labs</li>
                                <li><i className="fas fa-check-circle"></i> Community support</li>
                                <li><i className="fas fa-check-circle"></i> Career guidance</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right side - Signup Form */}
                    <div className="auth-main">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2>Create Your Account</h2>
                                <p>Start learning in minutes</p>
                            </div>

                            {/* Success Message */}
                            {success && (
                                <div className="alert alert-success">
                                    <i className="fas fa-check-circle"></i> {success}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i> {error}
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="fas fa-user"></i> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Developer"
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="developer@example.com"
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">
                                        <i className="fas fa-lock"></i> Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                    <div className="password-hint">
                                        <i className="fas fa-info-circle"></i> Must be at least 8 characters
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <i className="fas fa-lock"></i> Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Remember Me checkbox */}
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            className="checkbox-input"
                                            disabled={loading}
                                        />
                                        <span className="checkbox-custom"></span>
                                        Keep me logged in for 7 days
                                        <span className="checkbox-hint">(Don't check for session-only login)</span>
                                    </label>
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleChange}
                                            className="checkbox-input"
                                            disabled={loading}
                                        />
                                        <span className="checkbox-custom"></span>
                                        Send me learning tips, course updates, and community news
                                    </label>
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            required
                                            className="checkbox-input"
                                            disabled={loading}
                                        />
                                        <span className="checkbox-custom"></span>
                                        I agree to the{' '}
                                        <Link to="/terms" className="terms-link">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" className="terms-link">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    className={`auth-btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-rocket"></i> Start Learning Free
                                        </>
                                    )}
                                </button>

                                <div className="divider">
                                    <span>Or sign up with</span>
                                </div>

                                <div className="social-login">
                                    <button 
                                        type="button" 
                                        className="social-btn github"
                                        onClick={() => handleSocialSignup('GitHub')}
                                        disabled={loading}
                                    >
                                        <i className="fab fa-github"></i> GitHub
                                    </button>
                                    <button 
                                        type="button" 
                                        className="social-btn google"
                                        onClick={() => handleSocialSignup('Google')}
                                        disabled={loading}
                                    >
                                        <i className="fab fa-google"></i> Google
                                    </button>
                                </div>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    Already have an account?{' '}
                                    <Link to="/login" className="auth-link">
                                        Sign in here
                                    </Link>
                                </p>
                                <p className="back-link">
                                    <Link to="/">
                                        <i className="fas fa-arrow-left"></i> Back to Homepage
                                    </Link>
                                </p>
                            </div>

                            {/* Session Info Message */}
                            <div className="session-info">
                                <i className="fas fa-info-circle"></i>
                                {formData.rememberMe ? 
                                    "Your account will be remembered for 7 days." : 
                                    "You'll need to sign in again after closing the browser."
                                }
                            </div>

                            {/* Code Snippet for design consistency */}
                            <div className="auth-code-snippet">
                                <div className="code-line">
                                    <span className="line-number">1</span>
                                    <span className="code-comment">// Join the DevStorm community</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">2</span>
                                    <span className="code-keyword">const</span>
                                    <span className="code-text"> newDeveloper = </span>
                                    <span className="code-keyword">new</span>
                                    <span className="code-function"> Developer</span>
                                    <span className="code-text">(</span>
                                    <span className="code-string">name</span>
                                    <span className="code-text">, </span>
                                    <span className="code-string">email</span>
                                    <span className="code-text">);</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">3</span>
                                    <span className="code-function">DevStorm</span>
                                    <span className="code-text">.</span>
                                    <span className="code-function">welcome</span>
                                    <span className="code-text">(newDeveloper);</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">4</span>
                                    <span className="code-text">userId = </span>
                                    <span className="code-function">generateUserId</span>
                                    <span className="code-text">();</span>
                                    <span className="code-comment"> // User ID: {formData.rememberMe ? 'persistent' : 'session'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;