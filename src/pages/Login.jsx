import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import API, { fetchCsrfToken } from '../api/client';
import { API_BASE_URL } from '../api/config';
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
        
        if (error) setError('');
    };

    const saveAuthData = (authData) => {
        try {
            const userData = authData.user;
            const userId = userData._id || userData.id || userData.user_id;
            
            if (!userId) {
                console.error('User ID not found in auth response');
                setError('Authentication failed: User information missing');
                return;
            }

            if (formData.rememberMe) {
                const expires = new Date();
                expires.setDate(expires.getDate() + 7);
                
                Cookies.set('auth_token', authData.token, {
                    expires: expires,
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_id', userId.toString(), {
                    expires: expires,
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_data', JSON.stringify(userData), {
                    expires: expires,
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('remember_me', 'true', {
                    expires: expires,
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('remembered_email', formData.email, {
                    expires: expires,
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                console.log('Persistent Node auth data saved. User ID:', userId);
                
            } else {
                sessionStorage.setItem('user_id', userId.toString());
                sessionStorage.setItem('auth_token', authData.token);
                sessionStorage.setItem('user_data', JSON.stringify(userData));
                sessionStorage.setItem('is_session_only', 'true');
                
                Cookies.set('user_id', userId.toString(), {
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('auth_token', authData.token, {
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.set('user_data', JSON.stringify(userData), {
                    secure: true,
                    sameSite: 'strict',
                    path: '/'
                });
                
                Cookies.remove('remembered_email');
                
                console.log('Session-only Node auth data saved. User ID:', userId);
            }
            
            const loginTime = new Date().toISOString();
            sessionStorage.setItem('login_time', loginTime);
            sessionStorage.setItem('auth_method', 'login');
            
            localStorage.setItem('user_id', userId.toString());
            localStorage.setItem('user', JSON.stringify(userData));
            
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
        setError('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.password.length === 0) {
            setError('Please enter your password');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const loginData = {
                email: formData.email.trim(),
                password: formData.password
            };
            
            await fetchCsrfToken();
            console.log('📤 Making login request to:', '/login');
            
            const response = await API.post('/login', loginData);
            console.log('✅ Login response:', response.data);
            
            // Checks standard Node response patterns (e.g., { success: true } or look for token directly)
            if (response.data.success || response.data.token) {
                const payload = response.data.data || response.data;
                const userData = payload.user;
                const userId = userData._id || userData.id || userData.user_id;
                
                if (!userId) {
                    throw new Error('User ID not found in response');
                }
                
                saveAuthData({
                    token: payload.token || (payload.auth && payload.auth.token),
                    user: userData
                });
                
                sessionStorage.setItem('api_token', payload.token || (payload.auth && payload.auth.token));
                
                const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                localStorage.removeItem('redirectAfterLogin');
                
                window.dispatchEvent(new CustomEvent('authChange', {
                    detail: { userId: userId, isAuthenticated: true }
                }));
                
                setError('');
                alert('✅ Login successful! Redirecting...');
                navigate(redirectTo);
                
            } else {
                setError(response.data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            if (error.response) {
                // Node/Express typical error formats (e.g., handling array of errors from express-validator)
                if (error.response.status === 422 || error.response.status === 400) {
                    const resErrors = error.response.data.errors;
                    if (Array.isArray(resErrors)) {
                        // For array style: [{msg: 'Invalid password'}, ...]
                        setError(resErrors.map(err => err.msg || err.message).join(', '));
                    } else if (typeof resErrors === 'object') {
                        setError(Object.values(resErrors).join(', '));
                    } else {
                        setError(error.response.data.message || 'Validation error');
                    }
                } else if (error.response.status === 401) {
                    setError('Invalid email or password');
                } else if (error.response.status === 500) {
                    setError('Internal server error. Please try again later.');
                } else {
                    setError(error.response.data.message || 'Login failed');
                }
            } else if (error.request) {
                setError('Network error. Could not connect to the Node authentication server.');
            } else {
                setError('An error occurred. Please try again.');
            }
            
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        alert(`Social login with ${provider} is coming soon!`);
    };

    const handleForgotPassword = () => {
        alert('Forgot password feature coming soon!');
    };

    const testApiConnection = async () => {
        try {
            console.log('🔗 Testing API connection...');
            const response = await apiClient.get('/health', { timeout: 5000 });
            console.log('✅ API is accessible:', response.data);
            alert('✅ API connection successful!');
            return true;
        } catch (error) {
            console.error('❌ API connection failed:', error);
            alert('❌ Cannot connect to the live Node API.');
            return false;
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="gradient-circle gradient-1"></div>
                <div className="gradient-circle gradient-2"></div>
            </div>

            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-side">
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
                        
                        <button onClick={testApiConnection} className="api-test-btn" type="button">
                            <i className="fas fa-plug"></i> Test API Connection
                        </button>
                    </div>

                    <div className="auth-main">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2>Sign In to DevStorm</h2>
                                <p>Enter your credentials to continue</p>
                            </div>

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
                                    <button type="button" className="forgot-link" onClick={handleForgotPassword} disabled={loading}>
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" className={`auth-btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                                    {loading ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Signing In...</>
                                    ) : (
                                        <><i className="fas fa-sign-in-alt"></i> Sign In</>
                                    )}
                                </button>

                                <div className="divider">
                                    <span>Or continue with</span>
                                </div>

                                <div className="social-login">
                                    <button type="button" className="social-btn github" onClick={() => handleSocialLogin('GitHub')} disabled={loading}>
                                        <i className="fab fa-github"></i> GitHub
                                    </button>
                                    <button type="button" className="social-btn google" onClick={() => handleSocialLogin('Google')} disabled={loading}>
                                        <i className="fab fa-google"></i> Google
                                    </button>
                                </div>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="auth-link">Create one now</Link>
                                </p>
                                <p className="back-link">
                                    <Link to="/"><i className="fas fa-arrow-left"></i> Back to Homepage</Link>
                                </p>
                            </div>

                            <div className="session-info">
                                <i className="fas fa-info-circle"></i>
                                {formData.rememberMe ? "Your login will be saved for 7 days." : "Your login is session-only and will expire when you close the browser."}
                            </div>

                            <div className="auth-code-snippet">
                                <div className="code-line">
                                    <span className="line-number">1</span>
                                    <span className="code-comment">// Welcome to DevStorm</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">2</span>
                                    <span className="code-keyword">const</span> <span className="code-text">developer = </span><span className="code-function">authenticate</span><span className="code-text">(</span><span className="code-string">email</span><span className="code-text">, </span><span className="code-string">password</span><span className="code-text">);</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">3</span>
                                    <span className="code-text">userId = </span><span className="code-string">{formData.rememberMe ? "'persistent'" : "'session'"}</span> <span className="code-comment">// User ID saved accordingly</span>
                                </div>
                            </div>
                            
                            <div className="debug-info">
                                <p><strong>Node API Base URL:</strong> {API_BASE_URL}</p>
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