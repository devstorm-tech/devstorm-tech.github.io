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
        checkAuthStatus();
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkAuthStatus = () => {
        let isAuth = false;
        let userData = null;
        
        const sessionUser = sessionStorage.getItem('user');
        const sessionAuth = sessionStorage.getItem('auth_status');
        const cookieToken = Cookies.get('auth_token');
        const cookieUserData = Cookies.get('user_data');
        
        if (sessionUser && sessionAuth === 'authenticated') {
            isAuth = true;
            try {
                userData = JSON.parse(sessionUser);
            } catch (e) {
                console.error('Error parsing session user data:', e);
            }
        } else if (cookieToken && cookieUserData) {
            isAuth = true;
            try {
                userData = JSON.parse(cookieUserData);
            } catch (e) {
                console.error('Error parsing cookie user data:', e);
            }
        } else if (cookieToken || sessionAuth === 'authenticated') {
            isAuth = true;
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
        const clearAllCookies = () => {
            Cookies.remove('auth_token');
            Cookies.remove('token_type');
            Cookies.remove('token_expires');
            Cookies.remove('user_data');
            Cookies.remove('login_time');
            Cookies.remove('remember_me');
            Cookies.remove('remembered_email');
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        };

        sessionStorage.clear();
        localStorage.clear();
        clearAllCookies();
        localStorage.setItem('auth_status_changed', Date.now().toString());
        sessionStorage.setItem('auth_status_changed', Date.now().toString());
        setIsAuthenticated(false);
        setUser(null);
        closeMobileMenu();
        window.location.href = '/';
        window.location.reload();
    };

    const isUserAuthenticated = () => {
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

    const handleHomepageSection = (sectionId) => {
        closeMobileMenu();
        window.location.hash = '';
        if (window.location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                window.scrollTo({
                    top: element.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handlePageNavigation = () => {
        closeMobileMenu();
    };

    const handleHomeNavigation = () => {
        closeMobileMenu();
        window.location.hash = '';
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
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
                        <li>
                            <Link 
                                to="/" 
                                className="header-nav-link"
                                onClick={handleHomeNavigation}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/courses" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                Courses
                            </Link>
                        </li>
                        {/* Store link removed */}
                        <li>
                            <button 
                                onClick={() => handleHomepageSection('features')}
                                className="header-nav-link"
                            >
                                Features
                            </button>
                        </li>
                        <li>
                            <Link 
                                to="/news" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                News
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/about" 
                                className="header-nav-link"
                                onClick={handlePageNavigation}
                            >
                                About
                            </Link>
                        </li>
                        {/* Dashboard link (empty) removed */}
                    </ul>
                </nav>
                
                {/* Auth Buttons – only user dropdown shown when authenticated; no login/signup */}
                <div className="header-auth-buttons">
                    {isUserAuthenticated() ? (
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
                    ) : (
                        // No buttons displayed for non-authenticated users
                        <div style={{ display: 'none' }}></div>
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