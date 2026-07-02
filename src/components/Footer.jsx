import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Function to handle smooth scrolling for same-page links
    const handleLinkClick = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-column">
                        <h3 className="footer-title">DevStorm</h3>
                        <p className="footer-description">
                            The ultimate platform for learning programming and advancing your tech career.
                        </p>
                        <div className="social-links">
                            <a 
                                href="https://instagram.com/devstorm.official" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="social-link"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a 
                                href="https://github.com/devstorm" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="social-link"
                            >
                                <i className="fab fa-github"></i>
                            </a>
                            <a 
                                href="https://discord.gg/devstorm" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Discord"
                                className="social-link"
                            >
                                <i className="fab fa-discord"></i>
                            </a>
                            <a 
                                href="https://youtube.com/devstorm" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="social-link"
                            >
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div className="footer-column">
                        <h3 className="footer-title">Courses</h3>
                        <ul className="footer-links">
                            <li><a href="/courses/web-development">Web Development</a></li>
                            <li><a href="/courses/data-science">Data Science</a></li>
                            <li><a href="/courses/mobile-apps">Mobile Apps</a></li>
                            <li><a href="/courses/game-development">Game Development</a></li>
                            <li><a href="/courses/cybersecurity">Cybersecurity</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h3 className="footer-title">Resources</h3>
                        <ul className="footer-links">
                            <li><a href="/docs">Documentation</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/cheatsheets">Cheat Sheets</a></li>
                            <li><a href="/interview-prep">Interview Prep</a></li>
                            <li><a href="/career-guide">Career Guide</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h3 className="footer-title">Company</h3>
                        <ul className="footer-links">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="copyright">
                    <p>&copy; {currentYear} DevStorm. All rights reserved. <span className="highlight">Censole 100</span></p>
                    <p className="signature">dv# D/v/&gt;</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;