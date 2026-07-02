import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

const featuresData = [
    {
        icon: 'fas fa-laptop-code',
        title: 'Interactive Learning',
        description: 'Code directly in your browser with our interactive coding environment and instant feedback.',
        link: '/compiler', // Links to compiler
        linkText: 'Try Compiler'
    },
    {
        icon: 'fas fa-project-diagram',
        title: 'Real Projects',
        description: 'Build portfolio-worthy projects that simulate real-world development scenarios.',
        link: '/courses',
        linkText: 'Browse Projects'
    },
    {
        icon: 'fas fa-users',
        title: 'Community Driven',
        description: 'Join a thriving community of learners, mentors, and industry professionals.',
        link: '/signup',
        linkText: 'Join Community'
    },
    {
        icon: 'fas fa-road',
        title: 'Structured Paths',
        description: 'Follow curated learning paths designed to take you from beginner to job-ready.',
        link: '/courses',
        linkText: 'View Paths'
    },
    {
        icon: 'fas fa-chart-line',
        title: 'Track Progress',
        description: 'Monitor your learning journey with detailed progress tracking and analytics.',
        link: '/signup',
        linkText: 'Track Progress'
    },
    {
        icon: 'fas fa-certificate',
        title: 'Certifications',
        description: 'Earn recognized certifications to showcase your skills to employers.',
        link: '/courses',
        linkText: 'Get Certified'
    },
    {
        icon: 'fas fa-cloud',
        title: 'DevStorm Cloud Linux',
        description: 'Access Linux environments directly in your browser with DevStorm Cloud Linux (DCL). Practice Linux commands and server administration.',
        link: '/cloud-linux',
        linkText: 'Launch DCL'
    },
    {
        icon: 'fas fa-database',
        title: 'DevStorm Cloud Storage',
        description: 'Store and manage your projects with DCS - secure cloud storage integrated with all DevStorm learning environments.',
        link: '/store', // Assuming store has cloud storage
        linkText: 'Access Storage'
    },
    {
        icon: 'fas fa-terminal',
        title: 'Online Compilers',
        description: 'Run code in 50+ programming languages with our built-in online compilers. No setup required.',
        link: '/compiler',
        linkText: 'Open Compiler'
    },
    {
        icon: 'fas fa-shield-alt',
        title: 'Security Testing Labs',
        description: 'Practice ethical hacking and security testing in our isolated, safe sandbox environments.',
        link: '/courses', // Assuming security courses
        linkText: 'Security Labs'
    }
];

const statsData = [
    { number: '500K+', label: 'Developers' },
    { number: '100+', label: 'Courses', link: '/courses' },
    { number: '50+', label: 'Languages', link: '/compiler' },
    { number: '24/7', label: 'Support' }
];

const Features = () => {
    return (
        <section className="features-section" id="features">
            <div className="features-container">
                <div className="features-title">
                    <h2>Why DevStorm</h2>
                    <p className="features-subtitle">Discover what makes our platform unique</p>
                </div>
                
                <div className="features-grid">
                    {featuresData.map((feature, index) => (
                        <div key={index} className="features-item">
                            <div className="features-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            {feature.link && (
                                <Link to={feature.link} className="features-link">
                                    {feature.linkText}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Stats Section with links */}
                <div className="features-stats">
                    {statsData.map((stat, index) => (
                        <div key={index} className="features-stat-item">
                            {stat.link ? (
                                <Link to={stat.link} className="features-stat-link">
                                    <div className="features-stat-number">{stat.number}</div>
                                    <div className="features-stat-label">{stat.label}</div>
                                </Link>
                            ) : (
                                <>
                                    <div className="features-stat-number">{stat.number}</div>
                                    <div className="features-stat-label">{stat.label}</div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;