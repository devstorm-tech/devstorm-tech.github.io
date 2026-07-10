import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MyProfile.css';

// API base URL - adjust this based on your Laravel setup
const API_BASE_URL = 'http://localhost:8000/api';

const MyProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        bio: '',
        location: '',
        github: '',
        linkedin: '',
        twitter: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const stats = [
        { label: 'Courses Completed', value: '24', icon: 'fas fa-check-circle' },
        { label: 'Learning Hours', value: '156', icon: 'fas fa-clock' },
        { label: 'Certificates', value: '8', icon: 'fas fa-certificate' },
        { label: 'Streak Days', value: '42', icon: 'fas fa-fire' }
    ];

    const skills = ['React', 'JavaScript', 'Node.js', 'Python', 'MongoDB', 'CSS', 'HTML', 'Git'];
    const recentCourses = [
        { id: 1, title: 'Advanced React Patterns', progress: 85 },
        { id: 2, title: 'Full Stack Development', progress: 60 },
        { id: 3, title: 'Cloud Architecture', progress: 45 },
        { id: 4, title: 'DevOps Fundamentals', progress: 30 }
    ];

    const achievements = [
        { id: 1, title: 'Early Bird', description: 'Completed 10 courses in 30 days', icon: 'fas fa-award' },
        { id: 2, title: 'Code Master', description: 'Solved 100+ coding challenges', icon: 'fas fa-code' },
        { id: 3, title: 'Community Hero', description: 'Helped 50+ community members', icon: 'fas fa-hands-helping' },
        { id: 4, title: 'Streak Champion', description: '30-day learning streak', icon: 'fas fa-fire' }
    ];

    // Function to get auth token from storage
    const getAuthToken = () => {
        // Check cookies first
        const cookies = document.cookie.split('; ');
        const authTokenCookie = cookies.find(row => row.startsWith('auth_token='));
        
        if (authTokenCookie) {
            return authTokenCookie.split('=')[1];
        }
        
        // Check session storage
        const sessionToken = sessionStorage.getItem('auth_token');
        if (sessionToken) {
            return sessionToken;
        }
        
        return null;
    };

    // Function to get user data from storage (cookies and session)
    const getUserFromStorage = () => {
        try {
            let userData = null;
            
            // Check cookies first
            const cookies = document.cookie.split('; ');
            const userDataCookie = cookies.find(row => row.startsWith('user_data='));
            
            if (userDataCookie) {
                const userDataString = decodeURIComponent(userDataCookie.split('=')[1]);
                userData = JSON.parse(userDataString);
            }
            
            // If no cookie, check session storage
            if (!userData) {
                const sessionUserData = sessionStorage.getItem('user_data');
                if (sessionUserData) {
                    userData = JSON.parse(sessionUserData);
                }
            }
            
            return userData;
        } catch (error) {
            console.error('Error parsing user data from storage:', error);
            return null;
        }
    };

    // Function to update both cookies and session storage
    const updateUserStorage = (updatedUserData) => {
        try {
            const currentUser = getUserFromStorage();
            const mergedUserData = {
                ...currentUser,
                ...updatedUserData
            };
            
            // Update cookies if they exist
            const cookies = document.cookie.split('; ');
            const userDataCookie = cookies.find(row => row.startsWith('user_data='));
            if (userDataCookie) {
                document.cookie = `user_data=${encodeURIComponent(JSON.stringify(mergedUserData))}; path=/; max-age=2592000`; // 30 days
            }
            
            // Update session storage
            sessionStorage.setItem('user_data', JSON.stringify(mergedUserData));
            
            // Also update localStorage if it exists (for consistency)
            localStorage.setItem('user_data', JSON.stringify(mergedUserData));
            
            return mergedUserData;
        } catch (error) {
            console.error('Error updating user storage:', error);
            return null;
        }
    };

    // Function to fetch profile from API
    const fetchProfileFromAPI = async () => {
        const token = getAuthToken();
        
        if (!token) {
            navigate('/login');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 401) {
                navigate('/login');
                return null;
            }

            const data = await response.json();

            if (data.success) {
                return data.data.user;
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch profile from API' });
                return null;
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
            return null;
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            const userData = getUserFromStorage();
            const token = getAuthToken();
            
            if (!token || !userData) {
                navigate('/login');
                return;
            }

            setUser(userData);
            
            // Parse social links if they exist
            let socialLinks = {};
            if (userData.social_links) {
                socialLinks = typeof userData.social_links === 'string' 
                    ? JSON.parse(userData.social_links) 
                    : userData.social_links;
            }

            setEditForm({
                name: userData.name || '',
                email: userData.email || '',
                bio: userData.bio || 'Passionate developer learning new technologies every day.',
                location: userData.location || 'Cairo, Egypt',
                github: socialLinks.github || '',
                linkedin: socialLinks.linkedin || '',
                twitter: socialLinks.twitter || '',
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
            
            setLoading(false);
        };

        loadUserData();
    }, [navigate]);

    const handleEditToggle = async () => {
        if (isEditing) {
            // Cancel edit - fetch fresh data from API
            const apiUser = await fetchProfileFromAPI();
            if (apiUser) {
                let socialLinks = apiUser.social_links || {};
                
                setEditForm({
                    name: apiUser.name || '',
                    email: apiUser.email || '',
                    bio: apiUser.bio || 'Passionate developer learning new technologies every day.',
                    location: apiUser.location || 'Cairo, Egypt',
                    github: socialLinks.github || '',
                    linkedin: socialLinks.linkedin || '',
                    twitter: socialLinks.twitter || '',
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                
                setUser(apiUser);
                updateUserStorage(apiUser);
            }
        }
        
        setIsEditing(!isEditing);
        setMessage({ type: '', text: '' });
        setEditForm(prev => ({
            ...prev,
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        const token = getAuthToken();
        
        if (!token) {
            setMessage({ type: 'error', text: 'Authentication required' });
            navigate('/login');
            return;
        }

        setSaveLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare data for API
            const updateData = {};
            const currentUser = getUserFromStorage();
            
            if (!currentUser) {
                setMessage({ type: 'error', text: 'User data not found' });
                setSaveLoading(false);
                return;
            }
            
            // Only send fields that are different from current user
            if (editForm.name !== currentUser.name) updateData.name = editForm.name;
            if (editForm.email !== currentUser.email) updateData.email = editForm.email;
            if (editForm.bio !== currentUser.bio) updateData.bio = editForm.bio;
            if (editForm.location !== currentUser.location) updateData.location = editForm.location;
            
            // Handle social links
            let currentSocialLinks = {};
            if (currentUser.social_links) {
                currentSocialLinks = typeof currentUser.social_links === 'string' 
                    ? JSON.parse(currentUser.social_links) 
                    : currentUser.social_links;
            }
            
            const socialUpdate = {};
            if (editForm.github !== currentSocialLinks.github) socialUpdate.github = editForm.github || null;
            if (editForm.linkedin !== currentSocialLinks.linkedin) socialUpdate.linkedin = editForm.linkedin || null;
            if (editForm.twitter !== currentSocialLinks.twitter) socialUpdate.twitter = editForm.twitter || null;
            
            // Add social links if there are changes
            if (Object.keys(socialUpdate).length > 0) {
                const mergedSocial = { ...currentSocialLinks, ...socialUpdate };
                // Remove null values
                Object.keys(mergedSocial).forEach(key => {
                    if (mergedSocial[key] === null) {
                        delete mergedSocial[key];
                    }
                });
                updateData.github = editForm.github || null;
                updateData.linkedin = editForm.linkedin || null;
                updateData.twitter = editForm.twitter || null;
            }
            
            // Password change
            if (editForm.new_password) {
                updateData.current_password = editForm.current_password;
                updateData.new_password = editForm.new_password;
                updateData.new_password_confirmation = editForm.new_password_confirmation;
            }

            // Check if there are any changes
            const hasChanges = Object.keys(updateData).length > 0;
            if (!hasChanges) {
                setIsEditing(false);
                setMessage({ type: 'info', text: 'No changes detected' });
                setSaveLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/profile/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                // Update user state with new data
                const updatedUser = data.data.user;
                setUser(updatedUser);
                
                // Update local storage
                updateUserStorage(updatedUser);
                
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully! Refreshing page...' });
                
                // Clear password fields
                setEditForm(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                }));
                
                // Wait 1.5 seconds to show success message, then refresh the page
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } else {
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    setMessage({ type: 'error', text: errorMessages });
                } else {
                    setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleGoToCourses = () => {
        navigate('/courses');
    };

    const handleViewCertificate = (certId) => {
        navigate(`/certificate/${certId}`);
    };

    if (loading) {
        return (
            <div className="myprofile-page">
                <div className="myprofile-container">
                    <div className="myprofile-loading">
                        <div className="myprofile-spinner"></div>
                        <p>Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="myprofile-page">
            {/* Hero Section */}
            <section className="myprofile-hero">
                <div className="myprofile-container">
                    <div className="myprofile-hero-content">
                        <div className="myprofile-header">
                            <div className="myprofile-avatar">
                                <div className="myprofile-avatar-initials">
                                    {user?.name?.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <div className="myprofile-header-info">
                                <h1 className="myprofile-hero-title">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleInputChange}
                                            className="myprofile-edit-input"
                                            placeholder="Your Name"
                                        />
                                    ) : (
                                        <span className="myprofile-gradient-text">{user?.name}</span>
                                    )}
                                </h1>
                                <p className="myprofile-hero-subtitle">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleInputChange}
                                            className="myprofile-edit-input"
                                            placeholder="Your Email"
                                        />
                                    ) : (
                                        user?.email
                                    )}
                                </p>
                                <div className="myprofile-header-actions">
                                    <button 
                                        type="button"
                                        className="myprofile-btn myprofile-btn-outline"
                                        onClick={handleEditToggle}
                                        disabled={saveLoading}
                                    >
                                        <i className="fas fa-edit"></i>
                                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                    </button>
                                    {isEditing ? (
                                        <button 
                                            type="button"
                                            className="myprofile-btn myprofile-btn-primary"
                                            onClick={handleSaveProfile}
                                            disabled={saveLoading}
                                        >
                                            <i className="fas fa-check"></i>
                                            {saveLoading ? 'Saving...' : 'Confirm Edit'}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            className="myprofile-btn myprofile-btn-primary"
                                            onClick={handleGoToDashboard}
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            Go to Dashboard
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Message Display */}
                        {message.text && (
                            <div className={`myprofile-message myprofile-message-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="myprofile-code-snippet">
                            <div className="myprofile-code-line">
                                <span className="myprofile-line-number">1</span>
                                <span className="myprofile-code-comment">// Profile Information</span>
                            </div>
                            <div className="myprofile-code-line">
                                <span className="myprofile-line-number">2</span>
                                <span className="myprofile-code-keyword">const</span>
                                <span className="myprofile-code-text"> developer = </span>
                                <span className="myprofile-code-string">"Full Stack Developer"</span>
                                <span className="myprofile-code-text">;</span>
                            </div>
                            <div className="myprofile-code-line">
                                <span className="myprofile-line-number">3</span>
                                <span className="myprofile-code-keyword">const</span>
                                <span className="myprofile-code-text"> status = </span>
                                <span className="myprofile-code-string">"Always Learning"</span>
                                <span className="myprofile-code-text">;</span>
                            </div>
                            <div className="myprofile-code-line">
                                <span className="myprofile-line-number">4</span>
                                <span className="myprofile-code-keyword">let</span>
                                <span className="myprofile-code-text"> skills = [</span>
                                <span className="myprofile-code-string">"React"</span>
                                <span className="myprofile-code-text">, </span>
                                <span className="myprofile-code-string">"Node.js"</span>
                                <span className="myprofile-code-text">, </span>
                                <span className="myprofile-code-string">"Python"</span>
                                <span className="myprofile-code-text">];</span>
                            </div>
                            <div className="myprofile-code-line">
                                <span className="myprofile-line-number">5</span>
                                <span className="myprofile-code-function">DevStorm</span>
                                <span className="myprofile-code-text">.</span>
                                <span className="myprofile-code-function">transform</span>
                                <span className="myprofile-code-text">(</span>
                                <span className="myprofile-code-variable">developer</span>
                                <span className="myprofile-code-text">);</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="myprofile-stats-section">
                <div className="myprofile-container">
                    <div className="myprofile-section-header">
                        <h2>Learning Statistics</h2>
                        <p className="myprofile-section-subtitle">
                            Track your progress and achievements
                        </p>
                    </div>
                    
                    <div className="myprofile-stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="myprofile-stat-card">
                                <div className="myprofile-stat-icon">
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="myprofile-stat-number">{stat.value}</div>
                                <div className="myprofile-stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Profile Info Section */}
            <section className="myprofile-info-section">
                <div className="myprofile-container">
                    <div className="myprofile-info-grid">
                        {/* Left Column - Bio and Skills */}
                        <div className="myprofile-info-left">
                            <div className="myprofile-card">
                                <h3>About Me</h3>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={editForm.bio}
                                        onChange={handleInputChange}
                                        className="myprofile-edit-textarea"
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="myprofile-bio">{editForm.bio}</p>
                                )}
                                
                                <div className="myprofile-meta">
                                    <div className="myprofile-meta-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="location"
                                                value={editForm.location}
                                                onChange={handleInputChange}
                                                className="myprofile-edit-input small"
                                                placeholder="Location"
                                            />
                                        ) : (
                                            <span>{editForm.location}</span>
                                        )}
                                    </div>
                                    <div className="myprofile-meta-item">
                                        <i className="fas fa-calendar-alt"></i>
                                        <span>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2023'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="myprofile-card">
                                <h3>Skills & Technologies</h3>
                                <div className="myprofile-skills">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="myprofile-skill-tag">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Progress and Achievements */}
                        <div className="myprofile-info-right">
                            <div className="myprofile-card">
                                <h3>Course Progress</h3>
                                <div className="myprofile-courses-list">
                                    {recentCourses.map(course => (
                                        <div key={course.id} className="myprofile-course-item">
                                            <div className="myprofile-course-header">
                                                <span className="myprofile-course-title">{course.title}</span>
                                                <span className="myprofile-course-progress">{course.progress}%</span>
                                            </div>
                                            <div className="myprofile-progress-bar">
                                                <div 
                                                    className="myprofile-progress-fill"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    className="myprofile-btn myprofile-btn-primary full-width"
                                    onClick={handleGoToCourses}
                                >
                                    <i className="fas fa-play-circle"></i>
                                    Continue Learning
                                </button>
                            </div>

                            <div className="myprofile-card">
                                <h3>Achievements</h3>
                                <div className="myprofile-achievements-grid">
                                    {achievements.map(achievement => (
                                        <div key={achievement.id} className="myprofile-achievement">
                                            <div className="myprofile-achievement-icon">
                                                <i className={achievement.icon}></i>
                                            </div>
                                            <div className="myprofile-achievement-info">
                                                <h4>{achievement.title}</h4>
                                                <p>{achievement.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="myprofile-social-section">
                        <div className="myprofile-card">
                            <h3>Connect with Me</h3>
                            <div className="myprofile-social-links">
                                {isEditing ? (
                                    <>
                                        <div className="myprofile-social-input">
                                            <i className="fab fa-github"></i>
                                            <input
                                                type="text"
                                                name="github"
                                                value={editForm.github}
                                                onChange={handleInputChange}
                                                placeholder="GitHub Profile URL"
                                                className="myprofile-social-input-field"
                                            />
                                        </div>
                                        <div className="myprofile-social-input">
                                            <i className="fab fa-linkedin"></i>
                                            <input
                                                type="text"
                                                name="linkedin"
                                                value={editForm.linkedin}
                                                onChange={handleInputChange}
                                                placeholder="LinkedIn Profile URL"
                                                className="myprofile-social-input-field"
                                            />
                                        </div>
                                        <div className="myprofile-social-input">
                                            <i className="fab fa-twitter"></i>
                                            <input
                                                type="text"
                                                name="twitter"
                                                value={editForm.twitter}
                                                onChange={handleInputChange}
                                                placeholder="Twitter Profile URL"
                                                className="myprofile-social-input-field"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {editForm.github && (
                                            <a href={editForm.github} target="_blank" rel="noopener noreferrer" className="myprofile-social-link">
                                                <i className="fab fa-github"></i>
                                                GitHub
                                            </a>
                                        )}
                                        {editForm.linkedin && (
                                            <a href={editForm.linkedin} target="_blank" rel="noopener noreferrer" className="myprofile-social-link">
                                                <i className="fab fa-linkedin"></i>
                                                LinkedIn
                                            </a>
                                        )}
                                        {editForm.twitter && (
                                            <a href={editForm.twitter} target="_blank" rel="noopener noreferrer" className="myprofile-social-link">
                                                <i className="fab fa-twitter"></i>
                                                Twitter
                                            </a>
                                        )}
                                        {!editForm.github && !editForm.linkedin && !editForm.twitter && (
                                            <p className="myprofile-no-social">No social links added yet.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Change Section (only in edit mode) */}
                    {isEditing && (
                        <div className="myprofile-card">
                            <h3>Change Password</h3>
                            <div className="myprofile-password-form">
                                <div className="myprofile-form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={editForm.current_password}
                                        onChange={handleInputChange}
                                        className="myprofile-edit-input"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="myprofile-form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={editForm.new_password}
                                        onChange={handleInputChange}
                                        className="myprofile-edit-input"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="myprofile-form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="new_password_confirmation"
                                        value={editForm.new_password_confirmation}
                                        onChange={handleInputChange}
                                        className="myprofile-edit-input"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <p className="myprofile-password-hint">
                                    Leave password fields empty if you don't want to change your password.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Save Button for Edit Mode */}
                    {isEditing && (
                        <div className="myprofile-save-section">
                            <button 
                                type="button"
                                className="myprofile-btn myprofile-btn-primary save-btn"
                                onClick={handleSaveProfile}
                                disabled={saveLoading}
                            >
                                <i className="fas fa-save"></i>
                                {saveLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="myprofile-cta-section">
                <div className="myprofile-container">
                    <h2>Ready for Your Next Challenge?</h2>
                    <p className="myprofile-cta-text">
                        Explore new courses and continue your learning journey with DevStorm.
                    </p>
                    <div className="myprofile-cta-buttons">
                        <button 
                            type="button"
                            className="myprofile-btn myprofile-btn-primary"
                            onClick={handleGoToCourses}
                        >
                            <i className="fas fa-book"></i>
                            Browse Courses
                        </button>
                        <button 
                            type="button"
                            className="myprofile-btn myprofile-btn-outline"
                            onClick={() => handleViewCertificate('latest')}
                        >
                            <i className="fas fa-certificate"></i>
                            View Certificates
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MyProfile;