import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication on component mount
        checkAuthStatus();
        
        // Listen for auth changes
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkAuthStatus = () => {
        let isAuth = false;
        let userData = null;
        
        // Check Session Storage first
        const sessionUser = sessionStorage.getItem('user');
        const sessionAuth = sessionStorage.getItem('auth_status');
        
        // Check Cookies second
        const cookieToken = Cookies.get('auth_token');
        const cookieUserData = Cookies.get('user_data');
        
        // Priority 1: Session Storage (for recent logins)
        if (sessionUser && sessionAuth === 'authenticated') {
            isAuth = true;
            try {
                userData = JSON.parse(sessionUser);
            } catch (e) {
                console.error('Error parsing session user data:', e);
            }
        }
        // Priority 2: Cookies (for remember me or persistent sessions)
        else if (cookieToken && cookieUserData) {
            isAuth = true;
            try {
                userData = JSON.parse(cookieUserData);
            } catch (e) {
                console.error('Error parsing cookie user data:', e);
            }
        }
        // Priority 3: Check if there's any auth data anywhere
        else if (cookieToken || sessionAuth === 'authenticated') {
            // If we have partial data, still consider as authenticated
            isAuth = true;
            // Try to get user data from any available source
            if (sessionUser) {
                try {
                    userData = JSON.parse(sessionUser);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
        
        setIsAuthenticated(isAuth);
        setUser(userData);
    };

    const handleStorageChange = (e) => {
        if (e.key === 'auth_status_changed' || e.key === 'user') {
            checkAuthStatus();
        }
    };

    const logout = () => {
        // Clear ALL cookies (including those not managed by js-cookie)
        const clearAllCookies = () => {
            // Clear cookies using js-cookie
            Cookies.remove('auth_token');
            Cookies.remove('token_type');
            Cookies.remove('token_expires');
            Cookies.remove('user_data');
            Cookies.remove('login_time');
            Cookies.remove('remember_me');
            Cookies.remove('remembered_email');
            
            // Clear any other auth-related cookies by setting past expiration date
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        };

        // Clear Session Storage
        sessionStorage.clear();
        
        // Clear Local Storage (if used)
        localStorage.clear();
        
        // Clear all cookies
        clearAllCookies();
        
        // Trigger auth status change for other tabs/windows
        localStorage.setItem('auth_status_changed', Date.now().toString());
        sessionStorage.setItem('auth_status_changed', Date.now().toString());
        
        // Clear user state
        setIsAuthenticated(false);
        setUser(null);
        
        // Close mobile menu
        closeMobileMenu();
        
        // Force immediate navigation to homepage
        window.location.href = '/';
        window.location.reload();
    };

    // Enhanced authentication check before rendering protected elements
    const isUserAuthenticated = () => {
        // Check both session and cookies
        const hasSessionAuth = sessionStorage.getItem('auth_status') === 'authenticated';
        const hasSessionUser = sessionStorage.getItem('user');
        const hasCookieAuth = Cookies.get('auth_token');
        const hasCookieUser = Cookies.get('user_data');
        
        return (hasSessionAuth && hasSessionUser) || (hasCookieAuth && hasCookieUser);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Handle navigation to homepage sections
    const handleHomepageSection = (sectionId) => {
        closeMobileMenu();
        
        // Clear any previous hash
        window.location.hash = '';
        
        // If not on homepage, navigate to homepage with hash
        if (window.location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
        } else {
            // If on homepage, just scroll to section
            const element = document.getElementById(sectionId);
            if (element) {
                window.scrollTo({
                    top: element.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Handle regular page navigation
    const handlePageNavigation = () => {
        closeMobileMenu();
    };

    // Handle homepage navigation
    const handleHomeNavigation = () => {
        closeMobileMenu();
        // Clear hash when going to homepage
        window.location.hash = '';
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo that links to homepage */}
                <Link 
                    to="/" 
                    className="header-logo" 
                    onClick={handleHomeNavigation}
                >
                    <div className="header-logo-text">DevStorm</div>
                </Link>
                
                {/* Navigation Menu */}
                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul className="header-nav-links">
                        {/* Home - Goes to homepage */}
                        <li>
                            <Link 
                                to="/" 
                                className="header-nav-link"
                                onClick={handleHomeNavigation}
                            >
                                Home
                            </Link>
                        </li>
                        
                        {/* Courses - Links to Courses page */}
                        <li>
                            <Link 
                                to="/courses" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                Courses
                            </Link>
                        </li>
                        
                        {/* Store - Links to Store page */}
                        <li>
                            <Link 
                                to="/store" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                Store
                            </Link>
                        </li>
                        
                        {/* Features - Scrolls to features section on homepage */}
                        <li>
                            <button 
                                onClick={() => handleHomepageSection('features')}
                                className="header-nav-link"
                            >
                                Features
                            </button>
                        </li>
                        
                        {/* News - Links to News page */}
                        <li>
                            <Link 
                                to="/news" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                News
                            </Link>
                        </li>
                        
                        {/* About - Links to about page */}
                        <li>
                            <Link 
                                to="/about" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                About
                            </Link>
                        </li>

                        {/* Dashboard (only shown when authenticated) */}
                        {isUserAuthenticated() && (
                            <li>
                            </li>
                        )}
                    </ul>
                </nav>
                
                {/* Auth Buttons */}
                <div className="header-auth-buttons">
                    {isUserAuthenticated() ? (
                        <>
                            {/* User Profile Dropdown */}
                            <div className="user-dropdown">
                                <button className="user-dropdown-btn">
                                    {user?.name ? (
                                        <>
                                            <i className="fas fa-user-circle"></i>
                                            <span className="user-name">{user.name.split(' ')[0]}</span>
                                        </>
                                    ) : (
                                        <i className="fas fa-user-circle"></i>
                                    )}
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                                <div className="user-dropdown-content">
                                    <div className="user-dropdown-header">
                                        {user && (
                                            <>
                                                <p className="user-dropdown-name">{user.name}</p>
                                                <p className="user-dropdown-email">{user.email}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="user-dropdown-links">
                                        <Link 
                                            to="/profile" 
                                            className="user-dropdown-link"
                                            onClick={handlePageNavigation}
                                        >
                                            <i className="fas fa-user"></i> My Profile
                                        </Link>
                                        <Link 
                                            to="/settings" 
                                            className="user-dropdown-link"
                                            onClick={handlePageNavigation}
                                        >
                                            <i className="fas fa-cog"></i> Settings
                                        </Link>
                                        <Link 
                                            to="/my-courses" 
                                            className="user-dropdown-link"
                                            onClick={handlePageNavigation}
                                        >
                                            <i className="fas fa-book"></i> My Courses
                                        </Link>
                                        <button 
                                            className="user-dropdown-link logout-btn"
                                            onClick={logout}
                                        >
                                            <i className="fas fa-sign-out-alt"></i> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="header-btn header-btn-outline"
                                onClick={handlePageNavigation}
                            >
                                Log In
                            </Link>
                            <Link 
                                to="/signup" 
                                className="header-btn header-btn-primary"
                                onClick={handlePageNavigation}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="header-mobile-menu-btn" 
                    onClick={toggleMobileMenu}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;