import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page">
            {/* Background Elements */}
            <div className="background-gradients">
                <div className="gradient-1"></div>
                <div className="gradient-2"></div>
                <div className="gradient-3"></div>
            </div>

            <div className="container">
                <div className="not-found-content">
                    {/* Error Code with Animation */}
                    <div className="error-code">
                        <span className="code-digit">4</span>
                        <span className="code-digit">0</span>
                        <span className="code-digit">4</span>
                    </div>

                    {/* Error Message */}
                    <h1 className="error-title">Page Not Found</h1>
                    <p className="error-description">
                        The page you're looking for seems to have disappeared into the digital void.
                        It might have been moved, deleted, or never existed in the first place.
                    </p>

                    {/* Code Snippet */}
                    <div className="error-code-snippet">
                        <div className="code-line">
                            <span className="line-number">1</span>
                            <span className="code-comment">// 404 Error Debug</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">2</span>
                            <span className="code-keyword">try</span> <span className="code-text">{'{'}</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">3</span>
                            <span className="code-text">  </span>
                            <span className="code-function">loadPage</span>
                            <span className="code-text">(</span>
                            <span className="code-string">currentURL</span>
                            <span className="code-text">);</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">4</span>
                            <span className="code-text">{'}'}</span>
                            <span className="code-keyword"> catch</span>
                            <span className="code-text"> (</span>
                            <span className="code-variable">error</span>
                            <span className="code-text">) {'{'}</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">5</span>
                            <span className="code-text">  </span>
                            <span className="code-function">console</span>
                            <span className="code-text">.</span>
                            <span className="code-function">error</span>
                            <span className="code-text">(</span>
                            <span className="code-string">"Page not found in repository"</span>
                            <span className="code-text">);</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">6</span>
                            <span className="code-text">  </span>
                            <span className="code-function">redirectTo</span>
                            <span className="code-text">(</span>
                            <span className="code-string">"homepage"</span>
                            <span className="code-text">);</span>
                        </div>
                        <div className="code-line">
                            <span className="line-number">7</span>
                            <span className="code-text">{'}'}</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-container">
                        <div className="search-bar">
                            <i className="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search for courses, tutorials, or documentation..."
                            />
                            <button className="search-btn">Search</button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="quick-links">
                        <h3>Quick Navigation</h3>
                        <div className="links-grid">
                            <Link to="/" className="link-card">
                                <div className="link-icon">
                                    <i className="fas fa-home"></i>
                                </div>
                                <div className="link-content">
                                    <h4>Home</h4>
                                    <p>Return to homepage</p>
                                </div>
                            </Link>
                            <Link to="/courses" className="link-card">
                                <div className="link-icon">
                                    <i className="fas fa-graduation-cap"></i>
                                </div>
                                <div className="link-content">
                                    <h4>Courses</h4>
                                    <p>Browse all courses</p>
                                </div>
                            </Link>
                            <Link to="/about" className="link-card">
                                <div className="link-icon">
                                    <i className="fas fa-info-circle"></i>
                                </div>
                                <div className="link-content">
                                    <h4>About Us</h4>
                                    <p>Learn about DevStorm</p>
                                </div>
                            </Link>
                            <Link to="/community" className="link-card">
                                <div className="link-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="link-content">
                                    <h4>Community</h4>
                                    <p>Join our community</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="action-buttons">
                        <Link to="/" className="btn btn-primary">
                            <i className="fas fa-arrow-left"></i> Back to Homepage
                        </Link>
                        <button className="btn btn-outline" onClick={() => window.history.back()}>
                            <i className="fas fa-history"></i> Go Back
                        </button>
                        <a href="mailto:support@devstorm.com" className="btn btn-outline">
                            <i className="fas fa-life-ring"></i> Contact Support
                        </a>
                    </div>

                    {/* Debug Info */}
                    <div className="debug-info">
                        <div className="debug-item">
                            <span className="debug-label">Current URL:</span>
                            <code className="debug-value">{window.location.href}</code>
                        </div>
                        <div className="debug-item">
                            <span className="debug-label">Status:</span>
                            <span className="debug-badge error">404 Not Found</span>
                        </div>
                        <div className="debug-item">
                            <span className="debug-label">Timestamp:</span>
                            <span className="debug-value">{new Date().toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="floating-elements">
                <div className="floating-icon">
                    <i className="fas fa-code"></i>
                </div>
                <div className="floating-icon">
                    <i className="fas fa-bug"></i>
                </div>
                <div className="floating-icon">
                    <i className="fas fa-terminal"></i>
                </div>
            </div>
        </div>
    );
};

export default NotFound;