import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import './SingleCourse.css';

// Configure axios to include credentials for Sanctum
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const SingleCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Check authentication status using cookies and session data
    const checkAuthStatus = useCallback(async () => {
        try {
            console.log('🔐 Checking authentication status from cookies/session...');
            
            // Check for user_id in different storage locations
            let userId = null;
            let userData = null;

            // 1. Check cookies first (might have persistent login)
            const cookieUserId = Cookies.get('user_id');
            const cookieAuthToken = Cookies.get('auth_token');
            
            if (cookieUserId && cookieAuthToken) {
                console.log('🍪 Found user data in cookies');
                userId = cookieUserId;
                
                const cookieUserData = Cookies.get('user_data');
                if (cookieUserData) {
                    try {
                        userData = JSON.parse(cookieUserData);
                    } catch (e) {
                        console.error('Error parsing cookie user_data:', e);
                    }
                }
            }
            
            // 2. Check sessionStorage (for session-only logins)
            if (!userId) {
                const sessionUserId = sessionStorage.getItem('user_id');
                const sessionAuthToken = sessionStorage.getItem('auth_token');
                
                if (sessionUserId && sessionAuthToken) {
                    console.log('💾 Found user data in sessionStorage');
                    userId = sessionUserId;
                    
                    const sessionUserData = sessionStorage.getItem('user_data');
                    if (sessionUserData) {
                        try {
                            userData = JSON.parse(sessionUserData);
                        } catch (e) {
                            console.error('Error parsing session user_data:', e);
                        }
                    }
                }
            }
            
            // 3. Check localStorage (for quick access)
            if (!userId) {
                const localUserId = localStorage.getItem('user_id');
                if (localUserId) {
                    console.log('🏪 Found user data in localStorage');
                    userId = localUserId;
                    
                    const localUserData = localStorage.getItem('user');
                    if (localUserData) {
                        try {
                            userData = JSON.parse(localUserData);
                        } catch (e) {
                            console.error('Error parsing local user_data:', e);
                        }
                    }
                }
            }
            
            // If we have user data, set authentication state
            if (userId) {
                console.log('✅ User authenticated. User ID:', userId);
                
                // Set user data from storage
                if (!userData) {
                    userData = { id: userId };
                } else if (!userData.id) {
                    userData.id = userId;
                }
                
                setIsAuthenticated(true);
                setUser(userData);
                
                // IMPORTANT: Get CSRF token first for Laravel Sanctum
                await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
                    method: 'GET',
                    credentials: 'include',
                    mode: 'cors',
                });
                
                return true;
            } else {
                console.log('❌ No user data found in storage');
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error checking authentication from storage:', error);
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    }, []);

    // Check authentication on component mount
    useEffect(() => {
        const initializeAuth = async () => {
            const isAuth = await checkAuthStatus();
            setAuthChecked(true);
            
            // Fetch course only after auth is checked
            if (id) {
                await fetchCourse(isAuth);
            }
        };
        initializeAuth();
    }, [id, checkAuthStatus]);

    // Fetch course details
    const fetchCourse = useCallback(async (userIsAuthenticated = false) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📚 Fetching course:', id);
            
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Course response:', data);
            
            if (data.success) {
                const courseData = data.data.course || data.data;
                setCourse(courseData);
                
                // Check enrollment if user is authenticated
                if (userIsAuthenticated) {
                    await checkEnrollmentStatus();
                }
                
                // Fetch related courses by category
                if (courseData.category) {
                    fetchRelatedCourses(courseData.category, courseData.id);
                }
            } else {
                throw new Error(data.message || 'Course not found');
            }
        } catch (err) {
            setError(err.message || 'Failed to load course');
            console.error('❌ Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Get CSRF token from cookies
    const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return null;
    };

    // Check enrollment status
    const checkEnrollmentStatus = async () => {
        try {
            console.log('🔍 Checking enrollment status...');
            
            // First get CSRF cookie for Laravel Sanctum
            await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            const csrfToken = getCsrfToken();
            
            const response = await fetch(`${API_BASE_URL}/user/courses/check-enrollment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    course_ids: [parseInt(id)]
                })
            });

            console.log('📊 Enrollment check status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('📊 Enrollment check result:', result);
                
                if (result.success && result.data.enrollments && result.data.enrollments.length > 0) {
                    const enrollmentInfo = result.data.enrollments[0];
                    
                    if (enrollmentInfo.is_enrolled) {
                        setIsEnrolled(true);
                        await fetchDetailedEnrollment();
                    } else {
                        setIsEnrolled(false);
                        setEnrollment(null);
                    }
                } else {
                    setIsEnrolled(false);
                    setEnrollment(null);
                }
            } else if (response.status === 401) {
                console.log('🔒 User not authenticated for enrollment check');
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
                setIsEnrolled(false);
                setEnrollment(null);
            } else {
                console.error('❌ Enrollment check failed with status:', response.status);
                setIsEnrolled(false);
                setEnrollment(null);
            }
        } catch (error) {
            console.error('❌ Error checking enrollment:', error);
            setIsEnrolled(false);
            setEnrollment(null);
        }
    };

    // Clear authentication data
    const clearAuthData = () => {
        // Clear cookies
        Cookies.remove('auth_token');
        Cookies.remove('user_id');
        Cookies.remove('user_data');
        Cookies.remove('token_type');
        Cookies.remove('token_expires');
        Cookies.remove('remember_me');
        
        // Clear sessionStorage
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('is_session_only');
        sessionStorage.removeItem('login_time');
        sessionStorage.removeItem('auth_method');
        sessionStorage.removeItem('api_token');
        
        // Clear localStorage
        localStorage.removeItem('user_id');
        localStorage.removeItem('user');
    };

    // Handle enrollment
    const handleEnroll = async () => {
        console.log('🎯 Enrollment button clicked');
        console.log('👤 Current auth state:', isAuthenticated);
        console.log('👤 Current user:', user);
        
        // First ensure we're authenticated
        if (!isAuthenticated || !user) {
            console.log('🔒 Not authenticated, redirecting to login');
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
        }

        try {
            setEnrollLoading(true);
            
            // Get CSRF token first for Laravel Sanctum
            await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            const csrfToken = getCsrfToken();
            
            // Prepare enrollment data
            const enrollmentData = {
                course_id: parseInt(id)
            };
            
            // For paid courses, we need payment data
            // For now, we'll handle free courses or simulate payment for testing
            if (course && course.price > 0) {
                // In a real app, you would integrate with a payment gateway here
                enrollmentData.payment_method = 'card';
                enrollmentData.transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            console.log('📦 Enrollment data:', enrollmentData);
            console.log('🌐 Request URL:', `${API_BASE_URL}/user/courses/${id}/enroll`);
            console.log('🛡️ CSRF Token:', csrfToken ? 'Found' : 'Not found');
            
            // Make enrollment request
            const response = await fetch(`${API_BASE_URL}/user/courses/${id}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'include', // Include cookies for Laravel Sanctum
                body: JSON.stringify(enrollmentData)
            });

            console.log('📨 Enrollment response status:', response.status);
            
            let data;
            try {
                data = await response.json();
                console.log('📊 Enrollment response data:', data);
            } catch (e) {
                console.error('❌ Failed to parse enrollment response:', e);
                throw new Error('Invalid response from server');
            }

            if (data.success) {
                // Successfully enrolled
                console.log('✅ Successfully enrolled!');
                setIsEnrolled(true);
                
                // Set enrollment data
                setEnrollment(data.data.enrollment || {
                    status: 'active',
                    progress: 0,
                    enrolled_at: new Date().toISOString(),
                    ...enrollmentData
                });
                
                alert('🎉 Successfully enrolled in the course!');
                
                // Refresh course data to get updated student count
                await fetchCourse(true);
                
                // Navigate to learning page
                setTimeout(() => {
                    navigate(`/learn/${id}`);
                }, 1500);
                
            } else {
                console.error('❌ Enrollment failed:', data);
                
                if (response.status === 409) {
                    alert('ℹ️ You are already enrolled in this course.');
                    setIsEnrolled(true);
                    await checkEnrollmentStatus();
                } else if (response.status === 401) {
                    alert('🔒 Session expired. Please login again.');
                    clearAuthData();
                    setIsAuthenticated(false);
                    setUser(null);
                    navigate('/login');
                } else if (response.status === 422) {
                    // Validation errors
                    const errors = data.errors || data.message;
                    alert(`⚠️ Validation error: ${JSON.stringify(errors)}`);
                } else {
                    alert(`❌ ${data.message || 'Failed to enroll in course.'}`);
                }
            }
        } catch (err) {
            console.error('❌ Error enrolling:', err);
            alert(`❌ Error: ${err.message}`);
        } finally {
            setEnrollLoading(false);
        }
    };

    // Fetch detailed enrollment info
    const fetchDetailedEnrollment = async () => {
        try {
            console.log('🔍 Fetching detailed enrollment...');
            
            // Get CSRF token first for Laravel Sanctum
            await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            const csrfToken = getCsrfToken();
            
            const response = await fetch(`${API_BASE_URL}/user/courses/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'include',
            });

            console.log('📊 Detailed enrollment response:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Detailed enrollment data:', data);
                
                if (data.success) {
                    setEnrollment(data.data.enrollment || data.data);
                }
            } else if (response.status === 401) {
                console.log('🔒 User not authenticated for detailed enrollment');
                clearAuthData();
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('❌ Error fetching detailed enrollment:', error);
        }
    };

    // Fetch related courses
    const fetchRelatedCourses = async (category, excludeId) => {
        try {
            console.log('🔗 Fetching related courses for category:', category);
            const response = await fetch(`${API_BASE_URL}/categories/${category.slug || category}/courses?limit=4`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.data.courses) {
                    const filtered = data.data.courses.filter(c => c.id !== excludeId);
                    setRelatedCourses(filtered);
                }
            }
        } catch (err) {
            console.error('❌ Error fetching related courses:', err);
        }
    };

    // Handle continue learning
    const handleContinueLearning = () => {
        navigate(`/learn/${id}`);
    };

    // Helper functions
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        return price || '$0.00';
    };

    const getLevelClass = (level) => {
        if (!level) return 'course-level-beginner';
        switch(level.toLowerCase()) {
            case 'beginner': return 'course-level-beginner';
            case 'intermediate': return 'course-level-intermediate';
            case 'advanced': return 'course-level-advanced';
            default: return 'course-level-beginner';
        }
    };

    const getLevelText = (level) => {
        if (!level) return 'Beginner';
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="course-page">
                <div className="course-container">
                    <div className="course-loading">
                        <div className="course-spinner"></div>
                        <p>Loading course...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !course) {
        return (
            <div className="course-page">
                <div className="course-container">
                    <div className="course-error">
                        <i className="fas fa-exclamation-triangle course-error-icon"></i>
                        <h3>Error loading course</h3>
                        <p>{error}</p>
                        <button onClick={() => fetchCourse(isAuthenticated)} className="course-retry-btn">
                            <i className="fas fa-redo"></i> Try Again
                        </button>
                        <Link to="/courses" className="course-back-btn">
                            <i className="fas fa-arrow-left"></i> Browse All Courses
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="course-page">
            {/* Hero Banner */}
            <section className="course-hero">
                <div className="course-container">
                    <div className="course-hero-content">
                        <nav className="course-breadcrumb">
                            <Link to="/">Home</Link>
                            <i className="fas fa-chevron-right"></i>
                            <Link to="/courses">Courses</Link>
                            <i className="fas fa-chevron-right"></i>
                            {course.category && (
                                <>
                                    <Link to={`/courses?category=${course.category.slug}`}>
                                        {course.category.name}
                                    </Link>
                                    <i className="fas fa-chevron-right"></i>
                                </>
                            )}
                            <span>{course.title}</span>
                        </nav>
                        
                        <div className="course-hero-main">
                            <div className="course-hero-left">
                                {course.category && (
                                    <div className="course-category-badge" 
                                         style={{ backgroundColor: course.category.color || '#4f46e5' }}>
                                        <i className={course.category.icon || 'fas fa-tag'}></i>
                                        <span>{course.category.name}</span>
                                    </div>
                                )}
                                <h1 className="course-title">{course.title}</h1>
                                <p className="course-description">{course.description}</p>
                                
                                {/* Course metadata */}
                                <div className="course-hero-meta">
                                    <div className="course-meta-item">
                                        <i className="fas fa-user-graduate"></i>
                                        <div>
                                            <span className="course-meta-label">Instructor</span>
                                            <span className="course-meta-value">{course.instructor}</span>
                                        </div>
                                    </div>
                                    <div className="course-meta-item">
                                        <i className="far fa-clock"></i>
                                        <div>
                                            <span className="course-meta-label">Duration</span>
                                            <span className="course-meta-value">{course.duration || 'Self-paced'}</span>
                                        </div>
                                    </div>
                                    <div className="course-meta-item">
                                        <i className="fas fa-signal"></i>
                                        <div>
                                            <span className="course-meta-label">Level</span>
                                            <span className={`course-level ${getLevelClass(course.level)}`}>
                                                {getLevelText(course.level)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="course-meta-item">
                                        <i className="fas fa-star"></i>
                                        <div>
                                            <span className="course-meta-label">Rating</span>
                                            <span className="course-meta-value">
                                                {course.rating || '0.0'} ({course.total_ratings || 0} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollment info for enrolled users */}
                                {isEnrolled && enrollment && (
                                    <div className="course-enrollment-info">
                                        <div className="enrollment-status">
                                            <span className="enrollment-status-badge enrollment-status-active">
                                                Enrolled
                                            </span>
                                        </div>
                                        <div className="course-progress-container">
                                            <div className="course-progress-header">
                                                <span>Your Progress</span>
                                                <span>{enrollment.progress || 0}%</span>
                                            </div>
                                            <div className="course-progress-bar">
                                                <div 
                                                    className="course-progress-fill" 
                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="course-hero-right">
                                <div className="course-card-preview">
                                    <div className="course-preview-header">
                                        {course.category && (
                                            <div className="course-preview-icon" 
                                                 style={{ backgroundColor: course.category.color || '#4f46e5' }}>
                                                <i className={course.category.icon || 'fas fa-book'}></i>
                                            </div>
                                        )}
                                        {course.featured && (
                                            <div className="course-featured-badge">
                                                <i className="fas fa-crown"></i>
                                                <span>Featured</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="course-preview-price">
                                        {course.has_discount && course.discount_price && (
                                            <>
                                                <span className="course-price-old">{formatPrice(course.price)}</span>
                                                <span className="course-discount-badge">
                                                    -{course.discount_percentage || 0}%
                                                </span>
                                            </>
                                        )}
                                        <span className="course-price-new">
                                            {formatPrice(course.final_price || course.price)}
                                        </span>
                                    </div>
                                    
                                    <div className="course-preview-stats">
                                        <div className="course-stat">
                                            <i className="far fa-bookmark"></i>
                                            <span>{course.lessons || 0} Lessons</span>
                                        </div>
                                        <div className="course-stat">
                                            <i className="fas fa-users"></i>
                                            <span>{course.total_students || 0} Students</span>
                                        </div>
                                    </div>
                                    
                                    {/* Enrollment/Progress Actions */}
                                    <div className="course-preview-actions">
                                        {isEnrolled ? (
                                            <button 
                                                onClick={handleContinueLearning}
                                                className="course-continue-btn"
                                            >
                                                <i className="fas fa-play"></i>
                                                Continue Learning
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleEnroll}
                                                className="course-enroll-btn"
                                                disabled={enrollLoading}
                                            >
                                                <i className="fas fa-shopping-cart"></i>
                                                {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="course-preview-features">
                                        <div className="course-feature">
                                            <i className="fas fa-check-circle"></i>
                                            <span>Lifetime Access</span>
                                        </div>
                                        <div className="course-feature">
                                            <i className="fas fa-check-circle"></i>
                                            <span>Certificate of Completion</span>
                                        </div>
                                        <div className="course-feature">
                                            <i className="fas fa-check-circle"></i>
                                            <span>30-Day Money Back Guarantee</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Auth debug info */}
                                <div className="auth-debug-info">
                                    <h4>Authentication Status:</h4>
                                    <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
                                    <div><strong>Enrolled:</strong> {isEnrolled ? '✅ Yes' : '❌ No'}</div>
                                    <div><strong>User ID from storage:</strong> {user?.id || 'None'}</div>
                                    <div><strong>Storage Source:</strong> {
                                        Cookies.get('user_id') ? 'Cookies' : 
                                        sessionStorage.getItem('user_id') ? 'Session' : 
                                        localStorage.getItem('user_id') ? 'Local' : 'None'
                                    }</div>
                                    <div><strong>Course ID:</strong> {id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Rest of your component remains the same */}
        </div>
    );
};

export default SingleCourse;