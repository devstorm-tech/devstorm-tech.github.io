import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

// Define the new feature separately
const createBusinessFeature = {
    icon: 'fas fa-store',
    title: 'Create Your Own Business',
    description: 'Start and grow your own business with our comprehensive tools and resources. Get expert guidance and support.',
    link: 'https://wa.me/201554779311',
    linkText: 'Chat on WhatsApp',
    active: true,
    external: true
};

// Original features (excluding the new one)
const originalFeatures = [
    {
        icon: 'fas fa-laptop-code',
        title: 'Interactive Learning',
        description: 'Code directly in your browser with our interactive coding environment and instant feedback.',
        link: '/compiler',
        linkText: 'Try Compiler',
        active: true
    },
    {
        icon: 'fas fa-project-diagram',
        title: 'Real Projects',
        description: 'Build portfolio-worthy projects that simulate real-world development scenarios.',
        link: '/courses',
        linkText: 'Browse Projects',
        active: true
    },
    {
        icon: 'fas fa-users',
        title: 'Community Driven',
        description: 'Join a thriving community of learners, mentors, and industry professionals.',
        active: false
    },
    {
        icon: 'fas fa-road',
        title: 'Structured Paths',
        description: 'Follow curated learning paths designed to take you from beginner to job-ready.',
        link: '/courses',
        linkText: 'View Paths',
        active: true
    },
    {
        icon: 'fas fa-chart-line',
        title: 'Track Progress',
        description: 'Monitor your learning journey with detailed progress tracking and analytics.',
        active: false
    },
    {
        icon: 'fas fa-certificate',
        title: 'Certifications',
        description: 'Earn recognized certifications to showcase your skills to employers.',
        active: false
    },
    {
        icon: 'fas fa-cloud',
        title: 'DevStorm Cloud Linux',
        description: 'Access Linux environments directly in your browser with DevStorm Cloud Linux (DCL). Practice Linux commands and server administration.',
        active: false
    },
    {
        icon: 'fas fa-database',
        title: 'DevStorm Cloud Storage',
        description: 'Store and manage your projects with DCS - secure cloud storage integrated with all DevStorm learning environments.',
        active: false
    },
    {
        icon: 'fas fa-terminal',
        title: 'Online Compilers',
        description: 'Run code in 50+ programming languages with our built-in online compilers. No setup required.',
        link: '/compiler',
        linkText: 'Open Compiler',
        active: true
    },
    {
        icon: 'fas fa-shield-alt',
        title: 'Security Testing Labs',
        description: 'Practice ethical hacking and security testing in our isolated, safe sandbox environments.',
        active: false
    }
];

// Separate active and inactive from original
const activeFeatures = originalFeatures.filter(f => f.active === true);
const inactiveFeatures = originalFeatures.filter(f => f.active === false);

// Build final order: new feature first, then all active, then all inactive
const featuresData = [createBusinessFeature, ...activeFeatures, ...inactiveFeatures];

const statsData = [
    { number: '500K+', label: 'Developers' },
    { number: '100+', label: 'Courses' },
    { number: '50+', label: 'Languages' },
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
                            {feature.active ? (
                                feature.link && (
                                    feature.external ? (
                                        <a 
                                            href={feature.link} 
                                            className="features-link"
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            {feature.linkText}
                                        </a>
                                    ) : (
                                        <Link to={feature.link} className="features-link">
                                            {feature.linkText}
                                        </Link>
                                    )
                                )
                            ) : (
                                <span className="features-coming-soon">🚀 Coming Soon</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="features-stats">
                    {statsData.map((stat, index) => (
                        <div key={index} className="features-stat-item">
                            <div className="features-stat-number">{stat.number}</div>
                            <div className="features-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;