import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const SocialIcon = ({ type }) => {
    switch (type) {
        case 'linkedin':
            return (
                <svg viewBox="0 0 24 24" className="about-social-icon" aria-hidden="true">
                    <path d="M6.94 8.5A1.56 1.56 0 1 0 6.94 5.38a1.56 1.56 0 0 0 0 3.12ZM5.5 9.5h2.88V18H5.5zM10.2 9.5h2.76v1.16h.04c.38-.72 1.32-1.48 2.72-1.48 2.91 0 3.45 1.91 3.45 4.39V18H16.3v-7.4c0-1.76-.03-4.03-2.46-4.03-2.46 0-2.84 1.92-2.84 3.9V18H10.2z" fill="currentColor" />
                </svg>
            );
        case 'github':
            return (
                <svg viewBox="0 0 24 24" className="about-social-icon" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.48v-1.7c-2.78.62-3.37-1.24-3.37-1.24-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.84.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5.01 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92v2.84c0 .27.18.59.69.48A10.27 10.27 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" fill="currentColor" />
                </svg>
            );
        case 'email':
        default:
            return (
                <svg viewBox="0 0 24 24" className="about-social-icon" aria-hidden="true">
                    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1 2v1.2l7 4.2 7-4.2V8H5Zm14 2.8-6.2 3.7a1 1 0 0 1-.9 0L5 10.8V16h14V10.8Z" fill="currentColor" />
                </svg>
            );
    }
};

const About = () => {
    const navigate = useNavigate();

    const teamMembers = [
        {
            id: 1,
            name: 'Ahmed Sameh',
            role: 'Founder & Manager, Software Engineer',
            bio: 'Full‑stack developer with expertise in multiple ecosystems, security, and AI. Passionate about building scalable systems and mentoring the next generation of engineers.',
            skills: [
                'React', 'React Native', 'Laravel', '.NET', 'Java Spring', 'Django',
                'Node.js', 'Python Automation', 'AI/ML', 'Deep Learning',
                'Web Penetration Testing', 'Network Penetration Testing',
                'C++', 'C', 'Assembly', 'Unix System Development', 'Reverse Engineering'
            ],
            image: '👨‍💻',
            color: 'about-avatar-blue',
            social: {
                linkedin: 'https://www.linkedin.com/in/ahmed-gad-b798033a1?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                github: 'https://github.com/AhmedSamehGad',
                email: 'mailto:ahmad.sameh.gad@gmail.com'
            }
        },
        {
            id: 2,
            name: 'Ahmed Shady',
            role: 'Full‑Stack Web Developer',
            bio: 'Skilled in building modern web applications with React.js, Laravel, and Node.js. Focused on clean code and high performance.',
            skills: ['React.js', 'Laravel', 'Node.js'],
            image: '👨‍💻',
            color: 'about-avatar-purple',
            social: {
                linkedin: 'www.linkedin.com/in/ahmed-shady-8a0ba4416',
                github: 'https://github.com/getdatx'
            }
        },
        {
            id: 3,
            name: 'Habiba Hesham',
            role: 'Front-end Web Developer',
            bio: 'Passionate about creating intuitive frontend experiences with React ',
            skills: ['React'],
            image: '👩‍💻',
            color: 'about-avatar-green',
            social: {
                linkedin: 'https://www.linkedin.com/in/habiba-hesham-ewais?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                github: 'https://github.com/habibahesham'
            }
        },
        {
            id: 4,
            name: 'Rodina Mohamed',
            role: 'Full‑Stack Web Developer',
            bio: 'Loves building full‑stack solutions with modern JavaScript frameworks and PHP.',
            skills: ['React', 'Laravel', 'JavaScript'],
            image: '👩‍💻',
            color: 'about-avatar-pink',
            social: {
                linkedin: 'https://www.linkedin.com/in/rodina-mohamed-335148309',
                github: 'https://github.com/Rodina2110'
            }
        },
        {
            id: 5,
            name: 'Esraa Elshiekh',
            role: 'Front-end Developer',
            bio: 'Combines technical expertise in React and Laravel to build polished frontend experiences for the DevStorm community.',
            skills: ['React', 'Laravel'],
            image: '👩‍💻',
            color: 'about-avatar-orange',
            social: {
                linkedin: 'https://www.linkedin.com/in/habiba-hesham-ewais?utm_source=share_via&utm_content=profile&utm_medium=member_android'
            }
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

    const handleStartLearning = () => navigate('/courses');
    const handleJoinCommunity = () => navigate('/signup');

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
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {teamMembers.map((member) => {
                            const isWideCard = member.id === 1;

                            return (
                                <article
                                    key={member.id}
                                    className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-sky-400/30 bg-slate-900/80 p-6 shadow-[0_10px_30px_rgba(0,102,255,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-sky-400/60 ${isWideCard ? 'md:col-span-2 xl:col-span-2' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl shadow-lg ${member.color}`}>
                                            {member.image}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                                            <p className="mt-1 text-sm font-semibold text-sky-400">{member.role}</p>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-slate-300">{member.bio}</p>

                                    <div className="mt-4 flex flex-1 flex-wrap gap-2">
                                        {member.skills.map((skill, idx) => (
                                            <span key={idx} className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-4">
                                        {member.social.linkedin && (
                                            <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white" aria-label={`${member.name} LinkedIn`}>
                                                <SocialIcon type="linkedin" />
                                            </a>
                                        )}
                                        {member.social.github && (
                                            <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white" aria-label={`${member.name} GitHub`}>
                                                <SocialIcon type="github" />
                                            </a>
                                        )}
                                        {member.social.email && (
                                            <a href={member.social.email} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white" aria-label={`${member.name} Email`}>
                                                <SocialIcon type="email" />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="about-contact-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <h2>Contact Us</h2>
                        <p className="about-section-subtitle">
                            Have questions? We'd love to hear from you.
                        </p>
                    </div>
                    <div className="about-contact-grid">
                        <div className="about-contact-info">
                            <h3>Get in Touch</h3>
                            <p>Whether you have a question about our courses, want to collaborate, or just want to say hello, we're here to help.</p>
                            <ul className="about-contact-details">
                                <li><i className="fas fa-envelope"></i> info@devstorm.com</li>
                                <li><i className="fas fa-phone"></i> +1 (555) 123-4567</li>
                                <li><i className="fas fa-map-marker-alt"></i> Cairo, Egypt</li>
                            </ul>
                            {/* Contact social links – UPDATED with Instagram */}
                            <div className="about-contact-social">
                                <a href="https://www.facebook.com/share/1EMgssTxZ1/" className="about-social-link" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                                <a href="https://vt.tiktok.com/ZSCuKBHw5/" className="about-social-link" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
                                <a href="https://instagram.com/devstorm.official" className="about-social-link" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                                <a href="https://wa.me/201554779311" className="about-social-link" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                       
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;