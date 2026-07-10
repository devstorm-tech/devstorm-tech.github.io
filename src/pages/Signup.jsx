import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
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

    // Handle inputs changes dynamically for text, passwords, and checkboxes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Form submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation check
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            // Making the request to your API domain
            const response = await axios.post('https://api.devstorm.dev/api/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword, // Mapped to match your Postman body schema
                rememberMe: formData.rememberMe
            });

            setSuccess('Account created successfully!');

            // If your API sends back a token/session cookie instantly
            if (response.data?.token) {
                // Sets cookie to expire in 7 days if rememberMe is checked, otherwise a session cookie
                Cookies.set('token', response.data.token, { expires: formData.rememberMe ? 7 : undefined });
            }

            // Redirect user to login or dashboard after a brief delay
            setTimeout(() => {
                navigate('/login'); 
            }, 2000);

        } catch (err) {
            // Gracefully catch validation or server errors from the backend
            setError(err.response?.data?.message || 'An error occurred during signup. Please try again.');
        } finally {
            setLoading(false);
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
                                <h2>Create Your Account</h2>
                                <p>Start learning in minutes</p>
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

                            <div className="session-info">
                                <i className="fas fa-info-circle"></i>
                                {formData.rememberMe ? 
                                    "Your account will be remembered for 7 days." : 
                                    "You'll need to sign in again after closing the browser."
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;