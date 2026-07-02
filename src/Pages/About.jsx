import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
    const navigate = useNavigate();
    const teamMembers = [
        {
            id: 1,
            name: 'Ahmed Sameh',
            role: 'Founder & CEO',
            bio: 'Full-Stack Web Developer specialized in React front-end, Laravel back-end and web penetration testing.',
            skills: ['PHP', 'JavaScript', 'React', 'Laravel', 'Security'],
            image: '👨‍💻',
            color: 'about-avatar-blue'
        },
        {
            id: 2,
            name: 'Ahmed Shayd',
            role: 'CTO & Cloud Architect',
            bio: 'Cloud infrastructure expert with focus on scalable systems and DevOps practices.',
            skills: ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'Python'],
            image: '👨‍💻',
            color: 'about-avatar-purple'
        },
        {
            id: 3,
            name: 'Hussien Hazem',
            role: 'Lead Developer & Instructor',
            bio: 'Full-stack developer passionate about teaching modern web technologies and best practices.',
            skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL'],
            image: '👨‍💻',
            color: 'about-avatar-green'
        }
    ];

    const milestones = [
        { year: '2020', title: 'DevStorm Founded', description: 'Started with a mission to make programming education accessible to everyone.' },
        { year: '2021', title: 'First 10,000 Users', description: 'Reached our first major milestone of 10,000 active learners.' },
        { year: '2022', title: 'DevStorm Cloud Launch', description: 'Launched DCL and DCS cloud platforms for seamless learning.' },
        { year: '2023', title: '500K+ Developers', description: 'Helped over half a million developers advance their careers.' },
        { year: '2024', title: 'Global Expansion', description: 'Expanded courses to support 10+ languages worldwide.' }
    ];

    const values = [
        {
            icon: 'fas fa-graduation-cap',
            title: 'Accessibility First',
            description: 'We believe everyone should have access to quality programming education, regardless of background.'
        },
        {
            icon: 'fas fa-hands-helping',
            title: 'Community Driven',
            description: 'Learning is better together. Our community supports each other every step of the way.'
        },
        {
            icon: 'fas fa-rocket',
            title: 'Practical Focus',
            description: 'Real skills for real jobs. We focus on practical, project-based learning.'
        },
        {
            icon: 'fas fa-infinity',
            title: 'Continuous Innovation',
            description: 'Constantly evolving our platform with the latest technologies and teaching methods.'
        }
    ];

    const handleStartLearning = () => {
        navigate('/courses');
    };

    const handleJoinCommunity = () => {
        navigate('/signup');
    };

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-container">
                    <div className="about-hero-content">
                        <h1 className="about-hero-title">
                            About <span className="about-gradient-text">DevStorm</span>
                        </h1>
                        <p className="about-hero-subtitle">
                            Transforming how the world learns to code through innovation, community, and cutting-edge technology.
                        </p>
                        
                        <div className="about-code-snippet">
                            <div className="about-code-line">
                                <span className="about-line-number">1</span>
                                <span className="about-code-comment">// Our Mission</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">2</span>
                                <span className="about-code-keyword">const</span>
                                <span className="about-code-text"> mission = </span>
                                <span className="about-code-string">"Empower developers worldwide"</span>
                                <span className="about-code-text">;</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">3</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">4</span>
                                <span className="about-code-comment">// Our Vision</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">5</span>
                                <span className="about-code-keyword">const</span>
                                <span className="about-code-text"> vision = </span>
                                <span className="about-code-string">"Democratize programming education"</span>
                                <span className="about-code-text">;</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">6</span>
                            </div>
                            <div className="about-code-line">
                                <span className="about-line-number">7</span>
                                <span className="about-code-function">DevStorm</span>
                                <span className="about-code-text">.</span>
                                <span className="about-code-function">transform</span>
                                <span className="about-code-text">(</span>
                                <span className="about-code-variable">education</span>
                                <span className="about-code-text">);</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-mission-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <h2>Our Mission</h2>
                        <p className="about-section-subtitle">
                            To make programming education accessible, practical, and effective for everyone.
                        </p>
                    </div>
                    
                    <div className="about-mission-stats">
                        <div className="about-stat-card">
                            <div className="about-stat-number">500K+</div>
                            <div className="about-stat-label">Developers Trained</div>
                        </div>
                        <div className="about-stat-card">
                            <div className="about-stat-number">120+</div>
                            <div className="about-stat-label">Countries Reached</div>
                        </div>
                        <div className="about-stat-card">
                            <div className="about-stat-number">98%</div>
                            <div className="about-stat-label">Satisfaction Rate</div>
                        </div>
                        <div className="about-stat-card">
                            <div className="about-stat-number">24/7</div>
                            <div className="about-stat-label">Learning Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <h2>Our Values</h2>
                        <p className="about-section-subtitle">
                            The principles that guide everything we do at DevStorm
                        </p>
                    </div>
                    
                    <div className="about-values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="about-value-card">
                                <div className="about-value-icon">
                                    <i className={value.icon}></i>
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-team-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <h2>Meet Our Team</h2>
                        <p className="about-section-subtitle">
                            Passionate educators and developers dedicated to your success
                        </p>
                    </div>
                    
                    <div className="about-team-grid">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="about-team-card">
                                <div className={`about-team-avatar ${member.color}`}>
                                    {member.image}
                                </div>
                                <div className="about-team-info">
                                    <h3>{member.name}</h3>
                                    <p className="about-team-role">{member.role}</p>
                                    <p className="about-team-bio">{member.bio}</p>
                                    <div className="about-team-skills">
                                        {member.skills.map((skill, idx) => (
                                            <span key={idx} className="about-skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="about-timeline-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <h2>Our Journey</h2>
                        <p className="about-section-subtitle">
                            Key milestones in the DevStorm story
                        </p>
                    </div>
                    
                    <div className="about-timeline">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="about-timeline-item">
                                <div className="about-timeline-year">{milestone.year}</div>
                                <div className="about-timeline-content">
                                    <h3>{milestone.title}</h3>
                                    <p>{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta-section">
                <div className="about-container">
                    <h2>Join Our Community</h2>
                    <p className="about-cta-text">
                        Become part of the DevStorm community and accelerate your programming journey.
                    </p>
                    <div className="about-cta-buttons">
                        <button 
                            className="about-btn about-btn-primary"
                            onClick={handleStartLearning}
                        >
                            Start Learning Free
                        </button>
                        <button 
                            className="about-btn about-btn-outline"
                            onClick={handleJoinCommunity}
                        >
                            Join Community
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;