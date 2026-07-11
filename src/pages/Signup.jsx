import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import apiClient, { setAuthToken } from '../api/client';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();

    // Form state matching JSX inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        newsletter: false
    });

    // Request status indicators
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Verification states
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [tempToken, setTempToken] = useState(null);
    const [tempUserData, setTempUserData] = useState(null);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Handle inputs changes dynamically for text, passwords, and checkboxes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear errors when user types
        if (error) setError('');
        if (verificationError) setVerificationError('');
    };

    // Handle verification code input (only digits, max 6)
    const handleVerificationChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setVerificationCode(value);
            setVerificationError('');
        }
    };

    // Send verification email
    const sendVerificationEmail = async (email, token) => {
        try {
            await apiClient.post('/verify-email', {
                email,
                token,
                type: 'signup_verification'
            });
            
            // Start resend timer (5 minutes)
            setResendTimer(300);
            
            console.log('📧 Verification email sent to:', email);
            return true;
        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            setVerificationError('Failed to send verification code. Please try again.');
            return false;
        }
    };

    // Form submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);

        try {
            // Making the request to your API domain
            const response = await apiClient.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
                rememberMe: formData.rememberMe,
                newsletter: formData.newsletter
            });

            console.log('✅ Signup response:', response.data);

            const payload = response.data.data || response.data;
            if (response.data.success && payload.pending) {
                setShowVerification(true);
                setSuccess(payload.message || 'Account created! Please verify your email.');
                setError('');
                setTempToken(null);
                setTempUserData(null);
                return;
            }

            setError(response.data.message || 'Signup failed');

        } catch (err) {
            console.error('❌ Signup error:', err);
            
            if (err.response) {
                // Handle validation errors from express-validator
                if (err.response.status === 422 || err.response.status === 400) {
                    const resErrors = err.response.data.errors;
                    if (Array.isArray(resErrors)) {
                        setError(resErrors.map(err => err.msg || err.message).join(', '));
                    } else if (typeof resErrors === 'object') {
                        setError(Object.values(resErrors).join(', '));
                    } else {
                        setError(err.response.data.message || 'Validation error');
                    }
                } else if (err.response.status === 409) {
                    setError('An account with this email already exists. Please login instead.');
                } else if (err.response.status === 500) {
                    setError('Internal server error. Please try again later.');
                } else {
                    setError(err.response.data.message || 'An error occurred during signup. Please try again.');
                }
            } else if (err.request) {
                setError('Network error. Could not connect to the authentication server.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle verification code submission
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        
        if (!verificationCode || verificationCode.length !== 6) {
            setVerificationError('Please enter a valid 6-digit verification code');
            return;
        }
        
        setVerificationLoading(true);
        setVerificationError('');
        
        try {
            const response = await apiClient.post('/auth/verify-otp', {
                email: formData.email,
                code: verificationCode,
                rememberMe: formData.rememberMe
            });
            
            if (response.data.success) {
                const payload = response.data.data || response.data;
                const userData = payload.user || payload.data?.user;
                const authToken = payload.auth?.token || payload.token;

                saveAuthData({
                    token: authToken,
                    user: userData
                });
                
                sessionStorage.setItem('api_token', authToken);
                
                const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                localStorage.removeItem('redirectAfterLogin');
                
                window.dispatchEvent(new CustomEvent('authChange', {
                    detail: { 
                        userId: userData?._id || userData?.id, 
                        isAuthenticated: true 
                    }
                }));
                
                setSuccess('✅ Email verified successfully! Redirecting to your dashboard...');
                setError('');
                setVerificationError('');
                
                setTimeout(() => {
                    navigate(redirectTo);
                }, 1500);
                
            } else {
                setVerificationError(response.data.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('❌ Verification error:', error);
            
            if (error.response) {
                if (error.response.status === 400 || error.response.status === 401 || error.response.status === 422) {
                    setVerificationError(error.response?.data?.message || 'Invalid or expired verification code. Please try again.');
                } else if (error.response.status === 404) {
                    setVerificationError('Verification code expired (5 minutes). Please request a new one.');
                } else if (error.response.status === 429) {
                    setVerificationError('Too many attempts. Please wait a moment before trying again.');
                } else {
                    setVerificationError(error.response.data.message || 'Verification failed');
                }
            } else if (error.request) {
                setVerificationError('Network error. Please check your connection and try again.');
            } else {
                setVerificationError('An error occurred during verification. Please try again.');
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    // Resend verification code
    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        
        setVerificationLoading(true);
        setVerificationError('');
        
        try {
            const success = await sendVerificationEmail(formData.email, tempToken);
            if (success) {
                setVerificationError('');
                setSuccess('📧 New verification code sent to your email.');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setVerificationError('Failed to resend verification code. Please try again.');
        } finally {
            setVerificationLoading(false);
        }
    };

    // Save authentication data
    const saveAuthData = (authData) => {
        try {
            const userData = authData.user;
            const userId = userData._id || userData.id || userData.user_id;
            
            if (!userId) {
                console.error('User ID not found in auth response');
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
                
                console.log('Persistent auth data saved. User ID:', userId);
                
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
                
                console.log('Session-only auth data saved. User ID:', userId);
            }
            
            const loginTime = new Date().toISOString();
            sessionStorage.setItem('login_time', loginTime);
            sessionStorage.setItem('auth_method', 'signup');
            
            localStorage.setItem('user_id', userId.toString());
            localStorage.setItem('user', JSON.stringify(userData));
            
            setAuthToken(authData.token, formData.rememberMe);
            
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    };

    // Placeholder for OAuth social sign-ups
    const handleSocialSignup = (provider) => {
        console.log(`Initiating signup with ${provider}`);
        // Implement your window.location.href redirect to passport/OAuth provider here if needed
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="gradient-circle gradient-1"></div>
                <div className="gradient-circle gradient-2"></div>
                <div className="gradient-circle gradient-3"></div>
            </div>

            <div className="container">
                <div className="auth-wrapper">
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

                    <div className="auth-main">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2>{showVerification ? 'Verify Your Email' : 'Create Your Account'}</h2>
                                <p>{showVerification ? 'Enter the 6-digit code sent to your email' : 'Start learning in minutes'}</p>
                            </div>

                            {success && (
                                <div className="alert alert-success">
                                    <i className="fas fa-check-circle"></i> {success}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i> {error}
                                </div>
                            )}

                            {!showVerification ? (
                                // Signup Form
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
                                            <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
                                        ) : (
                                            <><i className="fas fa-rocket"></i> Start Learning Free</>
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
                            ) : (
                                // Verification Form
                                <form className="auth-form" onSubmit={handleVerifyCode}>
                                    {verificationError && (
                                        <div className="alert alert-error">
                                            <i className="fas fa-exclamation-circle"></i> 
                                            <div>{verificationError}</div>
                                        </div>
                                    )}
                                    
                                    <div className="verification-info">
                                        <div className="info-box">
                                            <i className="fas fa-info-circle"></i>
                                            <p>
                                                We've sent a 6-digit verification code to <strong>{formData.email}</strong>.
                                                The code is valid for 5 minutes.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="verificationCode">
                                            <i className="fas fa-shield-alt"></i> Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            id="verificationCode"
                                            value={verificationCode}
                                            onChange={handleVerificationChange}
                                            placeholder="Enter 6-digit code"
                                            required
                                            className="form-input verification-input"
                                            disabled={verificationLoading}
                                            maxLength="6"
                                        />
                                        <div className="code-hint">
                                            <i className="fas fa-clock"></i> 
                                            Code expires in: <span className="timer">{Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}</span>
                                        </div>
                                    </div>

                                    <div className="verification-actions">
                                        <button 
                                            type="button" 
                                            className="resend-btn" 
                                            onClick={handleResendCode}
                                            disabled={resendTimer > 0 || verificationLoading}
                                        >
                                            {resendTimer > 0 ? (
                                                <>
                                                    <i className="fas fa-clock"></i> 
                                                    Resend in {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-redo"></i> Resend Code
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="back-btn" 
                                            onClick={() => {
                                                setShowVerification(false);
                                                setVerificationCode('');
                                                setVerificationError('');
                                                setSuccess('');
                                            }}
                                            disabled={verificationLoading}
                                        >
                                            <i className="fas fa-arrow-left"></i> Back to Signup
                                        </button>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={`auth-btn btn-primary ${verificationLoading ? 'loading' : ''}`} 
                                        disabled={verificationLoading || !verificationCode || verificationCode.length !== 6}
                                    >
                                        {verificationLoading ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
                                        ) : (
                                            <><i className="fas fa-check-circle"></i> Verify Email</>
                                        )}
                                    </button>

                                    <div className="verification-footer-text">
                                        <p>
                                            <i className="fas fa-envelope"></i> 
                                            Email sent from: <strong>verify@devstorm.dev</strong>
                                        </p>
                                        <p className="spam-hint">
                                            <i className="fas fa-exclamation-triangle"></i> 
                                            Check your spam folder if you don't see the email.
                                        </p>
                                    </div>
                                </form>
                            )}

                            <div className="auth-footer">
                                {!showVerification ? (
                                    <>
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
                                    </>
                                ) : (
                                    <div className="verification-footer">
                                        <p className="back-link">
                                            <Link to="/">
                                                <i className="fas fa-arrow-left"></i> Back to Homepage
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!showVerification && (
                                <div className="session-info">
                                    <i className="fas fa-info-circle"></i>
                                    {formData.rememberMe ? 
                                        "Your account will be remembered for 7 days." : 
                                        "You'll need to sign in again after closing the browser."
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
