import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

    useEffect(() => {
        // Load remembered email on component mount
        loadRememberedEmail();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear errors when user types
        if (error) setError('');
    };

    const saveAuthData = (authData) => {
        try {
            const userData = authData.user;
            const userId = userData.id || userData.user_id || userData._id;
            
            if (!userId) {
                console.error('User ID not found in auth response');
                setError('Authentication failed: User information missing');
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
                
                Cookies.set('remembered_email', formData.email, {
                    expires: expires,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });
                
                console.log('Persistent auth data saved. User ID:', userId);
                
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
                
                // Clear remembered email for session-only login
                Cookies.remove('remembered_email');
                
                console.log('Session-only auth data saved. User ID:', userId);
            }
            
            // Save login timestamp and method
            const loginTime = new Date().toISOString();
            sessionStorage.setItem('login_time', loginTime);
            sessionStorage.setItem('auth_method', 'login');
            
            // Save user ID and data in localStorage for quick access
            localStorage.setItem('user_id', userId.toString());
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set authorization header for future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
            
        } catch (error) {
            console.error('Error saving auth data:', error);
            setError('Failed to save authentication data');
        }
    };

    const loadRememberedEmail = () => {
        const rememberedEmail = Cookies.get('remembered_email');
        if (rememberedEmail) {
            setFormData(prev => ({
                ...prev,
                email: rememberedEmail,
                rememberMe: true
            }));
        }
    };

    const validateForm = () => {
        // Reset errors
        setError('');
        
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        
        // Check password
        if (formData.password.length === 0) {
            setError('Please enter your password');
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
        
        try {
            // Prepare data for API
            const loginData = {
                email: formData.email.trim(),
                password: formData.password
            };
            
            console.log('🔐 Getting CSRF cookie for Laravel Sanctum...');
            
            // FIRST: Get CSRF cookie for Laravel Sanctum
            await apiClient.get('/sanctum/csrf-cookie');
            
            console.log('✅ CSRF cookie received');
            console.log('📤 Making login request to:', `${API_BASE_URL}/login`);
            
            // THEN: Make login API call
            const response = await apiClient.post('/api/login', loginData);
            
            console.log('✅ Login response:', response.data);
            
            if (response.data.success) {
                // Extract user ID from response
                const userData = response.data.data.user;
                const userId = userData.id || userData.user_id || userData._id;
                
                if (!userId) {
                    throw new Error('User ID not found in response');
                }
                
                // Save auth data (cookies + session)
                saveAuthData({
                    token: response.data.data.auth.token,
                    token_type: response.data.data.auth.token_type,
                    expires_at: response.data.data.auth.expires_at,
                    user: userData
                });
                
                // Save token in axios instance for immediate use
                sessionStorage.setItem('api_token', response.data.data.auth.token);
                
                // Redirect to dashboard or previous page
                const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                localStorage.removeItem('redirectAfterLogin');
                
                // Trigger auth status change for header update
                window.dispatchEvent(new CustomEvent('authChange', {
                    detail: { 
                        userId: userId,
                        isAuthenticated: true 
                    }
                }));
                
                // Show success message briefly
                setError('');
                alert('✅ Login successful! Redirecting...');
                
                navigate(redirectTo);
                
            } else {
                setError(response.data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
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
                } else if (error.response.status === 401) {
                    setError('Invalid email or password');
                } else if (error.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(error.response.data.message || 'Login failed');
                }
                
                console.log('📊 Error response data:', error.response.data);
                console.log('📊 Error response status:', error.response.status);
                console.log('📊 Error response headers:', error.response.headers);
                
            } else if (error.request) {
                // Request made but no response
                console.error('❌ No response received:', error.request);
                setError('Network error. Please check: \n1. Is the Laravel server running on port 8000? \n2. Check browser console for CORS errors \n3. Try refreshing the page');
            } else {
                // Something else happened
                setError('An error occurred. Please try again.');
                console.error('❌ Error:', error.message);
            }
            
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        // Placeholder for social login functionality
        alert(`Social login with ${provider} is coming soon!`);
    };

    const handleForgotPassword = () => {
        // Placeholder for forgot password
        alert('Forgot password feature coming soon!');
    };

    // Function to test API connection
    const testApiConnection = async () => {
        try {
            console.log('🔗 Testing API connection...');
            const response = await apiClient.get('/api/health', {
                timeout: 5000
            });
            console.log('✅ API is accessible:', response.data);
            alert('✅ API connection successful!');
            return true;
        } catch (error) {
            console.error('❌ API connection failed:', error);
            alert('❌ Cannot connect to API. Make sure Laravel server is running on port 8000.');
            return false;
        }
    };

    return (
        <div className="auth-page">
            {/* Background gradients */}
            <div className="auth-background">
                <div className="gradient-circle gradient-1"></div>
                <div className="gradient-circle gradient-2"></div>
            </div>

            <div className="container">
                <div className="auth-wrapper">
                    {/* Left side - Brand/Info */}
                    <div className="auth-side">
                        <div className="auth-brand">
                            <div className="logo-icon">DevStorm</div>
                            <div className="logo-text">DevStorm</div>
                        </div>
                        <h1 className="auth-side-title">Welcome Back</h1>
                        <p className="auth-side-text">
                            Continue your programming journey with access to all courses, 
                            practice labs, and community features.
                        </p>
                        <div className="auth-features">
                            <div className="feature-item">
                                <i className="fas fa-laptop-code"></i>
                                <span>Interactive Learning</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-cloud"></i>
                                <span>DevStorm Cloud Access</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-users"></i>
                                <span>Community Support</span>
                            </div>
                        </div>
                        
                        {/* API Connection Test Button */}
                        <button 
                            onClick={testApiConnection}
                            className="api-test-btn"
                            type="button"
                        >
                            <i className="fas fa-plug"></i> Test API Connection
                        </button>
                    </div>

                    {/* Right side - Login Form */}
                    <div className="auth-main">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2>Sign In to DevStorm</h2>
                                <p>Enter your credentials to continue</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i> 
                                    <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleSubmit}>
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
                                        placeholder="Enter your password"
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Remember Me checkbox with updated label */}
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
                                    <button 
                                        type="button" 
                                        className="forgot-link"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    className={`auth-btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt"></i> Sign In
                                        </>
                                    )}
                                </button>

                                <div className="divider">
                                    <span>Or continue with</span>
                                </div>

                                <div className="social-login">
                                    <button 
                                        type="button" 
                                        className="social-btn github"
                                        onClick={() => handleSocialLogin('GitHub')}
                                        disabled={loading}
                                    >
                                        <i className="fab fa-github"></i> GitHub
                                    </button>
                                    <button 
                                        type="button" 
                                        className="social-btn google"
                                        onClick={() => handleSocialLogin('Google')}
                                        disabled={loading}
                                    >
                                        <i className="fab fa-google"></i> Google
                                    </button>
                                </div>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="auth-link">
                                        Create one now
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
                                    "Your login will be saved for 7 days." : 
                                    "Your login is session-only and will expire when you close the browser."
                                }
                            </div>

                            {/* Code Snippet for design consistency */}
                            <div className="auth-code-snippet">
                                <div className="code-line">
                                    <span className="line-number">1</span>
                                    <span className="code-comment">// Welcome to DevStorm</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">2</span>
                                    <span className="code-keyword">const</span>
                                    <span className="code-text"> developer = </span>
                                    <span className="code-function">authenticate</span>
                                    <span className="code-text">(</span>
                                    <span className="code-string">email</span>
                                    <span className="code-text">, </span>
                                    <span className="code-string">password</span>
                                    <span className="code-text">);</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">3</span>
                                    <span className="code-text">userId = </span>
                                    <span className="code-string">{formData.rememberMe ? "'persistent'" : "'session'"}</span>
                                    <span className="code-comment">// User ID saved accordingly</span>
                                </div>
                            </div>
                            
                            {/* Debug Info */}
                            <div className="debug-info">
                                <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
                                <p><strong>CSRF Endpoint:</strong> http://localhost:8000/sanctum/csrf-cookie</p>
                                <p><strong>Login Endpoint:</strong> {API_BASE_URL}/login</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;