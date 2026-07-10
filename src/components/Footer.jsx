import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

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
                            {/* Social links – copied exactly from your request */}
                            <a 
                                href="https://www.facebook.com/share/1EMgssTxZ1/" 
                                className="social-link" 
                                aria-label="Facebook"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a 
                                href="https://vt.tiktok.com/ZSCuKBHw5/" 
                                className="social-link" 
                                aria-label="TikTok"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-tiktok"></i>
                            </a>
                            <a 
                                href="https://instagram.com/devstorm.official" 
                                className="social-link" 
                                aria-label="WhatsApp"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-whatsapp"></i>
                            </a>
                            <a 
                                href="https://wa.me/201554779311" 
                                className="social-link" 
                                aria-label="Instagram"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="copyright">
                    <p>&copy; {currentYear} DevStorm. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;